"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/action-result";
import { requireAdmin } from "@/lib/supabase/admin";
import {
  EXPENSE_CATEGORIES,
  PARTNER_NAMES,
  isPaidByOwner,
  settlementAmount,
  type ExpenseCategory,
} from "@/lib/admin/partner-split";

const INVOICE_BUCKET = "expense-invoices";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "webp", "heic"];

function revalidateFinances() {
  revalidatePath("/admin/finances");
  revalidatePath("/admin");
}

type ExpenseInput = {
  expense_date: string;
  category: string;
  description: string;
  amount: number;
  notes?: string | null;
  invoice_path?: string | null;
  paid?: boolean;
};

function validateExpense(data: ExpenseInput): string | null {
  if (!DATE_RE.test(data.expense_date)) return "Invalid date.";
  if (!EXPENSE_CATEGORIES.includes(data.category as ExpenseCategory)) {
    return "Invalid category.";
  }
  if (!data.description.trim()) return "Description is required.";
  if (!Number.isFinite(data.amount) || data.amount < 0) return "Invalid amount.";
  if (data.invoice_path && !data.invoice_path.startsWith("invoices/")) {
    return "Invalid invoice file.";
  }
  return null;
}

export async function createInvoiceUploadUrl(
  fileName: string,
): Promise<ActionResult<{ path?: string; signedUrl?: string }>> {
  const { supabase } = await requireAdmin();
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { success: false, message: "Upload a PDF or image file." };
  }

  const path = `invoices/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await supabase.storage
    .from(INVOICE_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    return { success: false, message: error?.message ?? "Could not prepare upload." };
  }
  return { success: true, message: "Ready.", path, signedUrl: data.signedUrl };
}

export async function createExpense(data: ExpenseInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const invalid = validateExpense(data);
  if (invalid) return { success: false, message: invalid };

  const { error } = await supabase.from("finance_expenses").insert({
    expense_date: data.expense_date,
    category: data.category,
    description: data.description.trim(),
    amount: data.amount,
    notes: data.notes?.trim() || null,
    invoice_path: data.invoice_path ?? null,
    paid_on: data.paid === false ? null : data.expense_date,
  });

  if (error) return { success: false, message: error.message };
  revalidateFinances();
  return { success: true, message: "Expense added." };
}

export async function updateExpense(
  id: string,
  data: ExpenseInput & { remove_invoice?: boolean },
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const invalid = validateExpense(data);
  if (invalid) return { success: false, message: invalid };

  const { data: existing } = await supabase
    .from("finance_expenses")
    .select("invoice_path, paid_on")
    .eq("id", id)
    .single();

  let invoicePath = existing?.invoice_path ?? null;
  if (data.invoice_path || data.remove_invoice) {
    if (invoicePath) {
      await supabase.storage.from(INVOICE_BUCKET).remove([invoicePath]);
    }
    invoicePath = data.invoice_path ?? null;
  }

  const { error } = await supabase
    .from("finance_expenses")
    .update({
      expense_date: data.expense_date,
      category: data.category,
      description: data.description.trim(),
      amount: data.amount,
      notes: data.notes?.trim() || null,
      invoice_path: invoicePath,
      paid_on:
        data.paid === false
          ? null
          : (existing?.paid_on ?? (data.paid ? data.expense_date : null)),
    })
    .eq("id", id);

  if (error) return { success: false, message: error.message };
  revalidateFinances();
  return { success: true, message: "Expense updated." };
}

export async function setExpensePaid(
  id: string,
  paid: boolean,
  paidOn?: string,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (paid && paidOn && !DATE_RE.test(paidOn)) {
    return { success: false, message: "Invalid date." };
  }

  const { error } = await supabase
    .from("finance_expenses")
    .update({ paid_on: paid ? (paidOn ?? new Date().toISOString().slice(0, 10)) : null })
    .eq("id", id);

  if (error) return { success: false, message: error.message };
  revalidateFinances();
  return { success: true, message: paid ? "Marked as paid." : "Marked as unpaid." };
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { data: existing } = await supabase
    .from("finance_expenses")
    .select("invoice_path")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("finance_expenses").delete().eq("id", id);
  if (error) return { success: false, message: error.message };

  if (existing?.invoice_path) {
    await supabase.storage.from(INVOICE_BUCKET).remove([existing.invoice_path]);
  }
  revalidateFinances();
  return { success: true, message: "Expense deleted." };
}

export async function createPayout(data: {
  paid_on: string;
  amount: number;
  method?: string | null;
  notes?: string | null;
}): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!DATE_RE.test(data.paid_on)) return { success: false, message: "Invalid date." };
  if (!Number.isFinite(data.amount) || data.amount <= 0) {
    return { success: false, message: "Amount must be more than zero." };
  }

  const { error } = await supabase.from("partner_payouts").insert({
    paid_on: data.paid_on,
    amount: data.amount,
    method: data.method?.trim() || null,
    notes: data.notes?.trim() || null,
  });

  if (error) return { success: false, message: error.message };
  revalidateFinances();
  return { success: true, message: "Payment recorded." };
}

export async function recordExpenseSettlement(
  expenseId: string,
  paidOn: string,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!DATE_RE.test(paidOn)) return { success: false, message: "Invalid date." };

  const { data: expense } = await supabase
    .from("finance_expenses")
    .select("category, description, amount, expense_date")
    .eq("id", expenseId)
    .single();

  if (!expense) return { success: false, message: "Expense not found." };

  const byOwner = isPaidByOwner(expense.category);
  const amount = settlementAmount(expense.category, expense.expense_date, expense.amount);
  if (amount <= 0) return { success: false, message: "Nothing to settle on this expense." };

  const payer = byOwner ? PARTNER_NAMES.incubator : PARTNER_NAMES.owner;
  const { error } = await supabase.from("partner_payouts").insert({
    paid_on: paidOn,
    amount,
    expense_id: expenseId,
    direction: byOwner ? "to_owner" : "to_incubator",
    notes: `${payer}'s share of ${expense.description}`,
  });

  if (error) {
    return {
      success: false,
      message: error.code === "23505" ? "Already recorded for this expense." : error.message,
    };
  }
  revalidateFinances();
  return { success: true, message: `Recorded ${payer}'s share.` };
}

export async function deletePayout(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("partner_payouts").delete().eq("id", id);
  if (error) return { success: false, message: error.message };
  revalidateFinances();
  return { success: true, message: "Payment deleted." };
}

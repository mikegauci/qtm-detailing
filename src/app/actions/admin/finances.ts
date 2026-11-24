"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/action-result";
import { requireAdmin } from "@/lib/supabase/admin";
import {
  EXPENSE_CATEGORIES,
  PARTNER_NAMES,
  isPaidByOwner,
  isSplitExpense,
  settlementAmount,
  type ExpenseCategory,
} from "@/lib/admin/partner-split";

const INVOICE_BUCKET = "expense-invoices";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "webp", "heic"];
const MAX_ATTACHMENTS = 10;

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
  invoice_paths?: string[];
  paid?: boolean;
  /** false = Max paid for it alone (e.g. equipment); kept out of the split. */
  shared?: boolean;
};

function validateExpense(data: ExpenseInput): string | null {
  if (!DATE_RE.test(data.expense_date)) return "Invalid date.";
  if (!EXPENSE_CATEGORIES.includes(data.category as ExpenseCategory)) {
    return "Invalid category.";
  }
  if (!data.description.trim()) return "Description is required.";
  if (!Number.isFinite(data.amount) || data.amount < 0) return "Invalid amount.";
  const paths = data.invoice_paths ?? [];
  if (paths.some((p) => !p.startsWith("invoices/") || p.includes(".."))) {
    return "Invalid attachment.";
  }
  if (paths.length > MAX_ATTACHMENTS) {
    return `Up to ${MAX_ATTACHMENTS} attachments per expense.`;
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
    invoice_paths: data.invoice_paths ?? [],
    paid_on: data.paid === false ? null : data.expense_date,
    shared: data.shared !== false,
  });

  if (error) return { success: false, message: error.message };
  revalidateFinances();
  return { success: true, message: "Expense added." };
}

export async function updateExpense(
  id: string,
  data: ExpenseInput & { remove_invoice_paths?: string[] },
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const invalid = validateExpense(data);
  if (invalid) return { success: false, message: invalid };

  const { data: existing } = await supabase
    .from("finance_expenses")
    .select("invoice_paths, paid_on")
    .eq("id", id)
    .single();
  if (!existing) return { success: false, message: "Expense not found." };

  const removing = new Set(data.remove_invoice_paths ?? []);
  const removed = existing.invoice_paths.filter((p: string) => removing.has(p));
  const invoicePaths = [
    ...existing.invoice_paths.filter((p: string) => !removing.has(p)),
    ...(data.invoice_paths ?? []),
  ];
  if (invoicePaths.length > MAX_ATTACHMENTS) {
    return { success: false, message: `Up to ${MAX_ATTACHMENTS} attachments per expense.` };
  }

  const { error } = await supabase
    .from("finance_expenses")
    .update({
      expense_date: data.expense_date,
      category: data.category,
      description: data.description.trim(),
      amount: data.amount,
      notes: data.notes?.trim() || null,
      invoice_paths: invoicePaths,
      paid_on:
        data.paid === false
          ? null
          : (existing.paid_on ?? (data.paid ? data.expense_date : null)),
      shared: data.shared !== false,
    })
    .eq("id", id);

  if (error) return { success: false, message: error.message };
  if (removed.length) {
    await supabase.storage.from(INVOICE_BUCKET).remove(removed);
  }
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
    .select("invoice_paths")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("finance_expenses").delete().eq("id", id);
  if (error) return { success: false, message: error.message };

  if (existing?.invoice_paths.length) {
    await supabase.storage.from(INVOICE_BUCKET).remove(existing.invoice_paths);
  }
  revalidateFinances();
  return { success: true, message: "Expense deleted." };
}

/** Turns an emailed invoice into a real expense, reusing the stored attachments. */
export async function acceptInboxInvoice(
  inboxId: string,
  data: ExpenseInput & { remove_invoice_paths?: string[] },
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { data: item } = await supabase
    .from("expense_inbox")
    .select("attachment_paths, status")
    .eq("id", inboxId)
    .single();
  if (!item || item.status !== "pending") {
    return { success: false, message: "This invoice was already handled." };
  }

  const removing = (data.remove_invoice_paths ?? []).filter((p) =>
    item.attachment_paths.includes(p),
  );
  const invoicePaths = [
    ...item.attachment_paths.filter((p: string) => !removing.includes(p)),
    ...(data.invoice_paths ?? []),
  ];
  const expense = { ...data, invoice_paths: invoicePaths };
  const invalid = validateExpense(expense);
  if (invalid) return { success: false, message: invalid };

  const { data: created, error } = await supabase
    .from("finance_expenses")
    .insert({
      expense_date: expense.expense_date,
      category: expense.category,
      description: expense.description.trim(),
      amount: expense.amount,
      notes: expense.notes?.trim() || null,
      invoice_paths: invoicePaths,
      paid_on: expense.paid === false ? null : expense.expense_date,
      shared: expense.shared !== false,
    })
    .select("id")
    .single();
  if (error || !created) return { success: false, message: error?.message ?? "Could not save." };

  await supabase
    .from("expense_inbox")
    .update({ status: "accepted", expense_id: created.id, attachment_paths: invoicePaths })
    .eq("id", inboxId);
  if (removing.length) await supabase.storage.from(INVOICE_BUCKET).remove(removing);

  revalidateFinances();
  return { success: true, message: "Expense added." };
}

export async function dismissInboxInvoice(inboxId: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { data: item } = await supabase
    .from("expense_inbox")
    .select("attachment_paths, status")
    .eq("id", inboxId)
    .single();
  if (!item || item.status !== "pending") {
    return { success: false, message: "This invoice was already handled." };
  }

  const { error } = await supabase
    .from("expense_inbox")
    .update({ status: "dismissed", attachment_paths: [] })
    .eq("id", inboxId);
  if (error) return { success: false, message: error.message };

  if (item.attachment_paths.length) {
    await supabase.storage.from(INVOICE_BUCKET).remove(item.attachment_paths);
  }
  revalidateFinances();
  return { success: true, message: "Invoice dismissed." };
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
    .select("category, description, amount, expense_date, shared")
    .eq("id", expenseId)
    .single();

  if (!expense) return { success: false, message: "Expense not found." };

  if (!isSplitExpense(expense)) {
    return { success: false, message: "This expense is not split, so there is nothing to settle." };
  }
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

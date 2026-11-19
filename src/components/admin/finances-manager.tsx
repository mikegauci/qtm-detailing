"use client";

import { useState, useTransition } from "react";
import { format, parseISO } from "date-fns";
import { Check, ExternalLink, FileText, HandCoins, Pencil, Plus, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import {
  createExpense,
  createInvoiceUploadUrl,
  createPayout,
  deleteExpense,
  deletePayout,
  recordExpenseSettlement,
  setExpensePaid,
  updateExpense,
} from "@/app/actions/admin/finances";
import {
  AdminDataTable,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
} from "@/components/admin/admin-data-table";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  PARTNER_NAMES,
  UTILITY_CATEGORIES,
  euro,
  isPaidByOwner,
  settlementAmount,
  type ExpenseCategory,
} from "@/lib/admin/partner-split";
import type { Tables } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

type Expense = Tables<"finance_expenses">;
type Payout = Tables<"partner_payouts">;

const MAX_INVOICE_BYTES = 10 * 1024 * 1024;

function paidBy(category: string) {
  return UTILITY_CATEGORIES.includes(category as ExpenseCategory)
    ? PARTNER_NAMES.incubator
    : PARTNER_NAMES.owner;
}

function splitLabel(category: string) {
  return UTILITY_CATEGORIES.includes(category as ExpenseCategory) ? "50/50" : "Profit split";
}

function isPdf(path: string) {
  return path.toLowerCase().endsWith(".pdf");
}

function InvoiceThumb({
  path,
  url,
  onOpen,
}: {
  path: string | null;
  url?: string;
  onOpen: () => void;
}) {
  if (!path || !url) {
    return <div className="h-10 w-10 rounded-md border border-dashed border-white/10" />;
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      title="Quick view invoice"
      className="block h-10 w-10 overflow-hidden rounded-md border border-white/10 bg-white/5 transition hover:border-brand-purple-400"
    >
      {isPdf(path) ? (
        <span className="flex h-full w-full flex-col items-center justify-center text-red-300">
          <FileText className="h-4 w-4" />
          <span className="text-[9px] font-semibold">PDF</span>
        </span>
      ) : (
        <img src={url} alt="Invoice" loading="lazy" className="h-full w-full object-cover" />
      )}
    </button>
  );
}

function formatDate(date: string) {
  return format(parseISO(date), "d MMM yyyy");
}

async function uploadInvoice(file: File): Promise<string | null> {
  if (file.size > MAX_INVOICE_BYTES) {
    toast.error("Invoice must be 10 MB or smaller.");
    return null;
  }
  const prepared = await createInvoiceUploadUrl(file.name);
  if (!prepared.success || !prepared.signedUrl || !prepared.path) {
    toast.error(prepared.message);
    return null;
  }
  const res = await fetch(prepared.signedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!res.ok) {
    toast.error("Invoice upload failed.");
    return null;
  }
  return prepared.path;
}

function ExpenseFields({ idPrefix, expense, today }: { idPrefix: string; expense?: Expense; today: string }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}_date`}>Date</Label>
          <Input
            id={`${idPrefix}_date`}
            name="expense_date"
            type="date"
            defaultValue={expense?.expense_date ?? today}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}_amount`}>Amount (€)</Label>
          <Input
            id={`${idPrefix}_amount`}
            name="amount"
            type="number"
            step="0.01"
            min="0"
            defaultValue={expense?.amount}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Select name="category" defaultValue={expense?.category ?? "products"}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {EXPENSE_CATEGORY_LABELS[c]} (paid by {paidBy(c)}, {splitLabel(c)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}_description`}>Description</Label>
        <Input
          id={`${idPrefix}_description`}
          name="description"
          placeholder="e.g. Koch Chemie shampoo, water & electric bill Oct"
          defaultValue={expense?.description}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}_invoice`}>
          Invoice (PDF or photo){expense?.invoice_path ? ", replaces current" : ""}
        </Label>
        <Input
          id={`${idPrefix}_invoice`}
          name="invoice"
          type="file"
          accept="application/pdf,image/*"
        />
        {expense?.invoice_path && (
          <label className="flex items-center gap-2 text-xs text-white/60">
            <input type="checkbox" name="remove_invoice" /> Remove current invoice
          </label>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm text-white/80">
        <input
          type="checkbox"
          name="paid"
          defaultChecked={expense ? Boolean(expense.paid_on) : true}
        />
        Already paid (unpaid bills are not counted in the split)
      </label>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}_notes`}>Notes</Label>
        <Textarea id={`${idPrefix}_notes`} name="notes" defaultValue={expense?.notes ?? ""} />
      </div>
    </>
  );
}

function readExpenseForm(formData: FormData) {
  return {
    expense_date: String(formData.get("expense_date") ?? ""),
    category: String(formData.get("category") ?? ""),
    description: String(formData.get("description") ?? ""),
    amount: Number(formData.get("amount")),
    notes: (formData.get("notes") as string) || null,
    paid: formData.get("paid") === "on",
  };
}

export function FinancesManager({
  expenses,
  payouts,
  invoiceUrls,
  today,
}: {
  expenses: Expense[];
  payouts: Payout[];
  invoiceUrls: Record<string, string>;
  today: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [showPayout, setShowPayout] = useState(false);
  const [previewing, setPreviewing] = useState<Expense | null>(null);
  const previewUrl = previewing?.invoice_path ? invoiceUrls[previewing.invoice_path] : undefined;

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const file = formData.get("invoice") as File | null;
      let invoicePath: string | null = null;
      if (file && file.size > 0) {
        invoicePath = await uploadInvoice(file);
        if (!invoicePath) return;
      }
      const result = await createExpense({ ...readExpenseForm(formData), invoice_path: invoicePath });
      if (result.success) {
        toast.success(result.message);
        setShowCreate(false);
      } else toast.error(result.message);
    });
  }

  function handleUpdate(formData: FormData) {
    if (!editing) return;
    const id = editing.id;
    startTransition(async () => {
      const file = formData.get("invoice") as File | null;
      let invoicePath: string | null = null;
      if (file && file.size > 0) {
        invoicePath = await uploadInvoice(file);
        if (!invoicePath) return;
      }
      const result = await updateExpense(id, {
        ...readExpenseForm(formData),
        invoice_path: invoicePath,
        remove_invoice: formData.get("remove_invoice") === "on",
      });
      if (result.success) {
        toast.success(result.message);
        setEditing(null);
      } else toast.error(result.message);
    });
  }

  function handleSetPaid(id: string, paid: boolean) {
    startTransition(async () => {
      const result = await setExpensePaid(id, paid, today);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  function handleSettle(expense: Expense) {
    const amount = settlementAmount(expense.category, expense.expense_date, expense.amount);
    const message = isPaidByOwner(expense.category)
      ? `Record that ${PARTNER_NAMES.incubator} paid ${PARTNER_NAMES.owner} ${euro.format(amount)} for this expense? Only do this if cash changed hands: it adds ${euro.format(amount)} back to what ${PARTNER_NAMES.owner} owes ${PARTNER_NAMES.incubator}.`
      : `Record that ${PARTNER_NAMES.owner} paid ${PARTNER_NAMES.incubator} ${euro.format(amount)} for this bill?`;
    if (!confirm(message)) return;
    startTransition(async () => {
      const result = await recordExpenseSettlement(expense.id, today);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  function handleDeleteExpense(id: string) {
    if (!confirm("Delete this expense and its invoice?")) return;
    startTransition(async () => {
      const result = await deleteExpense(id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  function handleCreatePayout(formData: FormData) {
    startTransition(async () => {
      const result = await createPayout({
        paid_on: String(formData.get("paid_on") ?? ""),
        amount: Number(formData.get("amount")),
        method: (formData.get("method") as string) || null,
        notes: (formData.get("notes") as string) || null,
      });
      if (result.success) {
        toast.success(result.message);
        setShowPayout(false);
      } else toast.error(result.message);
    });
  }

  function handleDeletePayout(id: string) {
    if (!confirm("Delete this payment record?")) return;
    startTransition(async () => {
      const result = await deletePayout(id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  const settlementByExpense = new Map(
    payouts.filter((p) => p.expense_id).map((p) => [p.expense_id as string, p]),
  );

  function handleUndoSettlement(payoutId: string) {
    if (!confirm("Undo this payment record?")) return;
    startTransition(async () => {
      const result = await deletePayout(payoutId);
      if (result.success) toast.success("Payment undone.");
      else toast.error(result.message);
    });
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Expenses and bills</h2>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Add expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add expense</DialogTitle>
              </DialogHeader>
              <form action={handleCreate} className="space-y-4">
                <ExpenseFields idPrefix="create" today={today} />
                <SubmitButton isPending={isPending} label="Add expense" pendingLabel="Saving..." />
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <AdminDataTable isEmpty={expenses.length === 0} emptyMessage="No expenses recorded yet.">
          <AdminTableHead>
            <AdminTableHeaderCell className="w-14">
              <span className="sr-only">Invoice preview</span>
            </AdminTableHeaderCell>
            <AdminTableHeaderCell>Date</AdminTableHeaderCell>
            <AdminTableHeaderCell>Description</AdminTableHeaderCell>
            <AdminTableHeaderCell>Category</AdminTableHeaderCell>
            <AdminTableHeaderCell>Paid by</AdminTableHeaderCell>
            <AdminTableHeaderCell>Amount</AdminTableHeaderCell>
            <AdminTableHeaderCell>Status</AdminTableHeaderCell>
            <AdminTableHeaderCell>Actions</AdminTableHeaderCell>
          </AdminTableHead>
          <tbody>
            {expenses.map((e) => (
              <AdminTableRow key={e.id}>
                <AdminTableCell>
                  <InvoiceThumb
                    path={e.invoice_path}
                    url={e.invoice_path ? invoiceUrls[e.invoice_path] : undefined}
                    onOpen={() => setPreviewing(e)}
                  />
                </AdminTableCell>
                <AdminTableCell className="whitespace-nowrap text-white/70">
                  {formatDate(e.expense_date)}
                </AdminTableCell>
                <AdminTableCell className="font-medium text-white">
                  {e.description}
                  {e.notes && <p className="text-xs font-normal text-white/50">{e.notes}</p>}
                </AdminTableCell>
                <AdminTableCell>
                  <Badge
                    variant={UTILITY_CATEGORIES.includes(e.category as ExpenseCategory) ? "warning" : "default"}
                  >
                    {EXPENSE_CATEGORY_LABELS[e.category as ExpenseCategory] ?? e.category}
                  </Badge>
                </AdminTableCell>
                <AdminTableCell className="text-white/70">{paidBy(e.category)}</AdminTableCell>
                <AdminTableCell className="tabular-nums text-white">
                  {euro.format(Number(e.amount))}
                </AdminTableCell>
                <AdminTableCell>
                  {e.paid_on ? (
                    <div className="flex flex-col items-start gap-1.5">
                      <div className="flex items-center gap-1">
                        <Badge variant="success">Paid {formatDate(e.paid_on)}</Badge>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => handleSetPaid(e.id, false)}
                          disabled={isPending}
                          title="Mark as unpaid"
                        >
                          <Undo2 className="h-4 w-4 text-white/50" />
                        </Button>
                      </div>
                      {settlementByExpense.has(e.id) ? (
                        <div className="flex items-center gap-1">
                          <Badge variant="success">
                            {isPaidByOwner(e.category)
                              ? PARTNER_NAMES.incubator
                              : PARTNER_NAMES.owner}
                            &apos;s share paid
                          </Badge>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => handleUndoSettlement(settlementByExpense.get(e.id)!.id)}
                            disabled={isPending}
                            title="Undo this payment"
                          >
                            <Undo2 className="h-4 w-4 text-white/50" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSettle(e)}
                          disabled={isPending}
                        >
                          <HandCoins className="h-4 w-4" />
                          {isPaidByOwner(e.category)
                            ? PARTNER_NAMES.incubator
                            : PARTNER_NAMES.owner}{" "}
                          paid{" "}
                          {euro.format(
                            settlementAmount(e.category, e.expense_date, e.amount),
                          )}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleSetPaid(e.id, true)}
                      disabled={isPending}
                    >
                      <Check className="h-4 w-4" />
                      Mark paid
                    </Button>
                  )}
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex gap-1">
                    <Dialog
                      open={editing?.id === e.id}
                      onOpenChange={(open) => setEditing(open ? e : null)}
                    >
                      <DialogTrigger asChild>
                        <Button size="icon-sm" variant="ghost" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit expense</DialogTitle>
                        </DialogHeader>
                        <form action={handleUpdate} className="space-y-4">
                          <ExpenseFields idPrefix="edit" expense={e} today={today} />
                          <SubmitButton isPending={isPending} label="Save changes" pendingLabel="Saving..." />
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleDeleteExpense(e.id)}
                      disabled={isPending}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </tbody>
        </AdminDataTable>

        <Dialog open={Boolean(previewing)} onOpenChange={(open) => !open && setPreviewing(null)}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{previewing?.description}</DialogTitle>
            </DialogHeader>
            {previewing?.invoice_path && previewUrl ? (
              <div className="space-y-3">
                {isPdf(previewing.invoice_path) ? (
                  <iframe
                    src={previewUrl}
                    title="Invoice PDF"
                    className="h-[70vh] w-full rounded-md border border-white/10 bg-white"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Invoice"
                    className="max-h-[70vh] w-full rounded-md object-contain"
                  />
                )}
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-brand-purple-400 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in new tab
                </a>
              </div>
            ) : (
              <p className="text-sm text-white/60">Invoice link expired. Refresh the page.</p>
            )}
          </DialogContent>
        </Dialog>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Job Payments</h2>
          <Dialog open={showPayout} onOpenChange={setShowPayout}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Record payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record payment to {PARTNER_NAMES.incubator}</DialogTitle>
              </DialogHeader>
              <form action={handleCreatePayout} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payout_date">Date</Label>
                    <Input id="payout_date" name="paid_on" type="date" defaultValue={today} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payout_amount">Amount (€)</Label>
                    <Input id="payout_amount" name="amount" type="number" step="0.01" min="0.01" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payout_method">Method</Label>
                  <Input id="payout_method" name="method" placeholder="Revolut, bank transfer, cash" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payout_notes">Notes</Label>
                  <Textarea id="payout_notes" name="notes" />
                </div>
                <SubmitButton isPending={isPending} label="Record payment" pendingLabel="Saving..." />
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <AdminDataTable isEmpty={payouts.length === 0} emptyMessage="No payments recorded yet.">
          <AdminTableHead>
            <AdminTableHeaderCell>Date</AdminTableHeaderCell>
            <AdminTableHeaderCell>Amount</AdminTableHeaderCell>
            <AdminTableHeaderCell>Method</AdminTableHeaderCell>
            <AdminTableHeaderCell>Notes</AdminTableHeaderCell>
            <AdminTableHeaderCell>Actions</AdminTableHeaderCell>
          </AdminTableHead>
          <tbody>
            {payouts.map((p) => (
              <AdminTableRow key={p.id}>
                <AdminTableCell className="whitespace-nowrap text-white/70">
                  {formatDate(p.paid_on)}
                </AdminTableCell>
                <AdminTableCell className="tabular-nums font-medium text-white">
                  {euro.format(Number(p.amount))}
                </AdminTableCell>
                <AdminTableCell className="text-white/70">
                  {p.direction === "to_owner" ? (
                    <Badge variant="destructive">
                      {PARTNER_NAMES.incubator} → {PARTNER_NAMES.owner}
                    </Badge>
                  ) : p.expense_id ? (
                    <Badge variant="warning">Utility half</Badge>
                  ) : (
                    (p.method ?? "—")
                  )}
                </AdminTableCell>
                <AdminTableCell className="text-white/70">{p.notes ?? "—"}</AdminTableCell>
                <AdminTableCell>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => handleDeletePayout(p.id)}
                    disabled={isPending}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </tbody>
        </AdminDataTable>
      </section>
    </div>
  );
}

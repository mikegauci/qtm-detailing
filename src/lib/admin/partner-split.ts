
export const EXPENSE_CATEGORIES = ["products", "other", "utilities"] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  products: "Products",
  other: "Other expense",
  utilities: "Water & electricity",
};

export const UTILITY_CATEGORIES: readonly ExpenseCategory[] = ["utilities"];

export const PARTNER_NAMES = { owner: "Max", incubator: "Mike" } as const;

const SPLIT_PERIODS = [
  { from: "2026-09-12", incubatorShare: 0.4 },
  { from: "0000-01-01", incubatorShare: 0.5 },
] as const;

export const UTILITY_INCUBATOR_SHARE = 0.5;

export const SETTLED_BEFORE = "2026-09-12";
export const SETTLED_BEFORE_LABEL = "12 Sep 2026";

export function incubatorShareOn(date: string) {
  return SPLIT_PERIODS.find((p) => date >= p.from)!.incubatorShare;
}

export function currentSplitLabel(today: string) {
  const mine = incubatorShareOn(today);
  return `${Math.round((1 - mine) * 100)}/${Math.round(mine * 100)}`;
}

export type RevenueRow = { booking_date: string; total_price: number };
export type ExpenseRow = {
  expense_date: string;
  category: string;
  amount: number;
  paid_on?: string | null;
  /** false = paid by the owner alone (e.g. equipment): recorded but not split. */
  shared?: boolean | null;
  /** Optional invoice lines; when present they decide what is split. */
  items?: unknown;
};

export type ExpenseItem = { description: string; amount: number; shared: boolean };

/** Reads the `items` JSON column defensively (bad rows are ignored). */
export function parseExpenseItems(value: unknown): ExpenseItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((i): i is Record<string, unknown> => Boolean(i) && typeof i === "object")
    .map((i) => ({
      description: String(i.description ?? ""),
      amount: Number(i.amount),
      shared: i.shared !== false,
    }))
    .filter((i) => Number.isFinite(i.amount));
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** The part of an expense the owner pays alone. Utilities are always fully split. */
export function ownerOnlyAmount(e: Pick<ExpenseRow, "category" | "shared" | "items" | "amount">) {
  if (UTILITY_CATEGORIES.includes(e.category as ExpenseCategory)) return 0;
  const items = parseExpenseItems(e.items);
  if (items.length) {
    return round2(items.filter((i) => !i.shared).reduce((sum, i) => sum + i.amount, 0));
  }
  return e.shared === false ? Number(e.amount) : 0;
}

/** The part of an expense that goes into the partner split. */
export function splitAmount(e: Pick<ExpenseRow, "category" | "shared" | "items" | "amount">) {
  return round2(Math.max(0, Number(e.amount) - ownerOnlyAmount(e)));
}
export type PayoutRow = { paid_on: string; amount: number; direction?: string | null };

export function isPaidByOwner(category: string) {
  return !UTILITY_CATEGORIES.includes(category as ExpenseCategory);
}

/** True when any part of the expense is split; utilities always split 50/50. */
export function isSplitExpense(e: Pick<ExpenseRow, "category" | "shared" | "items" | "amount">) {
  return splitAmount(e) > 0;
}

export function settlementAmount(category: string, expenseDate: string, amount: number) {
  const share = isPaidByOwner(category)
    ? incubatorShareOn(expenseDate)
    : 1 - UTILITY_INCUBATOR_SHARE;
  return Math.round(Number(amount) * share * 100) / 100;
}

export type PartnerSummary = {
  revenue: number;
  sharedExpenses: number;
  ownerOnlyExpenses: number;
  utilities: number;
  profit: number;
  incubatorProfit: number;
  ownerProfit: number;
  utilityReimbursement: number;
  incubatorNet: number;
  ownerNet: number;
  earned: number;
  paidOut: number;
  paidByIncubator: number;
  balance: number;
};

export function summarize(
  revenue: RevenueRow[],
  expenses: ExpenseRow[],
  payouts: PayoutRow[],
): PartnerSummary {
  let totalRevenue = 0;
  let incubatorRevenue = 0;
  for (const r of revenue) {
    const amount = Number(r.total_price);
    totalRevenue += amount;
    incubatorRevenue += amount * incubatorShareOn(r.booking_date);
  }

  let sharedExpenses = 0;
  let incubatorExpenses = 0;
  let utilities = 0;
  let ownerOnlyExpenses = 0;
  for (const e of expenses) {
    ownerOnlyExpenses += ownerOnlyAmount(e);
    const amount = splitAmount(e);
    if (UTILITY_CATEGORIES.includes(e.category as ExpenseCategory)) {
      utilities += amount;
    } else {
      sharedExpenses += amount;
      incubatorExpenses += amount * incubatorShareOn(e.expense_date);
    }
  }

  const profit = totalRevenue - sharedExpenses;
  const incubatorProfit = incubatorRevenue - incubatorExpenses;
  const ownerProfit = profit - incubatorProfit;
  const utilityReimbursement = utilities * (1 - UTILITY_INCUBATOR_SHARE);
  const utilityIncubatorCost = utilities * UTILITY_INCUBATOR_SHARE;
  const earned = incubatorProfit + utilityReimbursement;
  const paidOut = payouts
    .filter((p) => p.direction !== "to_owner")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const paidByIncubator = payouts
    .filter((p) => p.direction === "to_owner")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return {
    revenue: totalRevenue,
    sharedExpenses,
    ownerOnlyExpenses,
    utilities,
    profit,
    incubatorProfit,
    ownerProfit,
    utilityReimbursement,
    incubatorNet: incubatorProfit - utilityIncubatorCost,
    ownerNet: ownerProfit - utilityReimbursement,
    earned,
    paidOut,
    paidByIncubator,
    balance: earned - paidOut + paidByIncubator,
  };
}

export const euro = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});


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
};
export type PayoutRow = { paid_on: string; amount: number; direction?: string | null };

export function isPaidByOwner(category: string) {
  return !UTILITY_CATEGORIES.includes(category as ExpenseCategory);
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
  for (const e of expenses) {
    const amount = Number(e.amount);
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

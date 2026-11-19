import { format, parseISO } from "date-fns";

export const DATE_RANGES = ["this_month", "last_month", "three_months", "all"] as const;
export type DateRange = (typeof DATE_RANGES)[number];

export const DATE_RANGE_LABELS: Record<DateRange, string> = {
  this_month: "This month",
  last_month: "Last month",
  three_months: "3 months to date",
  all: "All time",
};

export function parseDateRange(value: string | undefined): DateRange {
  return DATE_RANGES.includes(value as DateRange) ? (value as DateRange) : "this_month";
}

function monthKey(today: string, monthsBack: number) {
  const d = parseISO(`${today.slice(0, 7)}-01`);
  d.setMonth(d.getMonth() - monthsBack);
  return format(d, "yyyy-MM");
}

export function inDateRange(date: string, range: DateRange, today: string) {
  if (range === "all") return true;
  if (range === "this_month") return date.startsWith(today.slice(0, 7));
  if (range === "last_month") return date.startsWith(monthKey(today, 1));
  return date >= `${monthKey(today, 2)}-01` && date <= today;
}

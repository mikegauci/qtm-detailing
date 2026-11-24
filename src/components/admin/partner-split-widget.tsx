import Link from "next/link";
import { Info } from "lucide-react";
import { DATE_RANGE_LABELS, inDateRange, type DateRange } from "@/lib/admin/date-range";
import { DateRangeTabs } from "@/components/admin/date-range-tabs";
import {
  PARTNER_NAMES,
  SETTLED_BEFORE,
  SETTLED_BEFORE_LABEL,
  currentSplitLabel,
  euro,
  summarize,
  type ExpenseRow,
  type PayoutRow,
  type RevenueRow,
} from "@/lib/admin/partner-split";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Line({
  label,
  value,
  sign,
  strong,
  muted,
}: {
  label: string;
  value: number;
  sign?: "+" | "−" | "=";
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 py-1.5 text-sm ${
        strong ? "border-t border-white/10 pt-2.5 font-semibold text-white" : ""
      } ${muted ? "text-white/50" : strong ? "" : "text-white/80"}`}
    >
      <span>
        {sign && <span className="mr-2 inline-block w-3 text-white/40">{sign}</span>}
        {label}
      </span>
      <span className="tabular-nums">{euro.format(value)}</span>
    </div>
  );
}

export function PartnerSplitWidget({
  revenue,
  expenses,
  payouts,
  range,
  today,
  basePath,
  showManageLink = false,
}: {
  revenue: RevenueRow[];
  expenses: ExpenseRow[];
  payouts: PayoutRow[];
  range: DateRange;
  today: string;
  basePath: string;
  showManageLink?: boolean;
}) {
  const paidExpenses = expenses.filter((e) => e.paid_on);
  const unpaidExpenses = expenses.filter((e) => !e.paid_on);
  const unpaidTotal = unpaidExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const pendingPayouts = payouts.filter((p) => p.paid_on >= SETTLED_BEFORE);
  const toIncubatorCount = pendingPayouts.filter((p) => p.direction !== "to_owner").length;
  const outstanding = summarize(
    revenue.filter((r) => r.booking_date >= SETTLED_BEFORE),
    paidExpenses.filter((e) => e.expense_date >= SETTLED_BEFORE),
    pendingPayouts,
  );
  const scoped = summarize(
    revenue.filter((r) => inDateRange(r.booking_date, range, today)),
    paidExpenses.filter((e) => inDateRange(e.expense_date, range, today)),
    payouts.filter((p) => inDateRange(p.paid_on, range, today)),
  );
  const { owner, incubator } = PARTNER_NAMES;
  const owed = outstanding.balance;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">Profit split</h2>
          <span className="group relative inline-flex">
            <button
              type="button"
              aria-label="How the profit split works"
              aria-describedby="profit-split-info"
              className="inline-flex rounded-full text-white/50 hover:text-white focus-visible:text-white focus-visible:outline-none"
            >
              <Info className="h-4 w-4" />
            </button>
            <span
              id="profit-split-info"
              role="tooltip"
              className="pointer-events-none absolute top-full left-0 z-20 mt-2 w-64 rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-xs text-white/80 opacity-0 shadow-lg transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
            >
              {owner}/{incubator} {currentSplitLabel(today)} on profit (50/50 before 12 Sep
              2026). Water & electricity always 50/50. Paid bookings only.
            </span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {showManageLink && (
            <Link
              href="/admin/finances"
              className="text-sm text-brand-purple-400 hover:underline"
            >
              Manage expenses
            </Link>
          )}
          <DateRangeTabs range={range} basePath={basePath} />
        </div>
      </div>

      <Card
        className={
          owed > 0.005
            ? "border-amber-500/30 bg-amber-500/10"
            : owed < -0.005
              ? "border-red-500/30 bg-red-500/10"
              : "border-emerald-500/30 bg-emerald-500/10"
        }
      >
        <CardContent className="grid gap-6 pt-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:items-center">
          <div
            className={
              owed > 0.005
                ? "text-amber-200"
                : owed < -0.005
                  ? "text-red-200"
                  : "text-emerald-200"
            }
          >
            <p className="text-sm opacity-80">
              {owed < -0.005
                ? `${incubator} overpaid by`
                : owed > 0.005
                  ? `${owner} still owes ${incubator}`
                  : `${incubator} is fully paid`}
            </p>
            <p className="mt-1 text-4xl font-bold tabular-nums">
              {euro.format(Math.abs(owed))}
            </p>
            <p className="mt-1 text-xs opacity-70">
              Since {SETTLED_BEFORE_LABEL}. Everything before is settled.
            </p>
          </div>
          <div>
            <Line
              label={`${incubator}'s profit share`}
              value={outstanding.incubatorProfit}
            />
            <Line
              label={`${owner}'s half of water & electricity`}
              value={outstanding.utilityReimbursement}
              sign="+"
            />
            <Line label={`${incubator} earned`} value={outstanding.earned} sign="=" strong />
            <Line
              label={`Paid to ${incubator} (${toIncubatorCount} payment${toIncubatorCount === 1 ? "" : "s"})`}
              value={outstanding.paidOut}
              sign="−"
            />
            {outstanding.paidByIncubator > 0 && (
              <Line
                label={`${incubator} paid ${owner} for expenses`}
                value={outstanding.paidByIncubator}
                sign="+"
              />
            )}
            <Line label="Still owed" value={owed} sign="=" strong />
          </div>
        </CardContent>
      </Card>

      {unpaidExpenses.length > 0 && (
        <Link
          href="/admin/finances"
          className="flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 hover:opacity-80"
        >
          <span>
            {unpaidExpenses.length} unpaid bill{unpaidExpenses.length === 1 ? "" : "s"},
            not counted until marked paid
          </span>
          <span className="font-semibold tabular-nums">{euro.format(unpaidTotal)}</span>
        </Link>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profit, {DATE_RANGE_LABELS[range].toLowerCase()}</CardTitle>
        </CardHeader>
        <CardContent>
          <Line label="Revenue (paid bookings)" value={scoped.revenue} />
          <Line label="Products and expenses" value={scoped.sharedExpenses} sign="−" />
          <Line label="Profit to split" value={scoped.profit} sign="=" strong />
          <Line label={`${owner}'s share`} value={scoped.ownerProfit} muted />
          <Line label={`${incubator}'s share`} value={scoped.incubatorProfit} muted />
          {scoped.ownerOnlyExpenses > 0 && (
            <div className="mt-2 border-t border-white/10 pt-1">
              <Line
                label={`${owner}-only purchases (not split)`}
                value={scoped.ownerOnlyExpenses}
                muted
              />
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

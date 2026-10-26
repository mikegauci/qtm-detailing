import Link from "next/link";
import { format, parseISO } from "date-fns";
import { getRelation } from "@/lib/admin/supabase-relations";
import { BOOKING_STATUS_LABELS } from "@/lib/utils/booking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type SalesRange = "this_month" | "last_month" | "all";

export const SALES_RANGE_LABELS: Record<SalesRange, string> = {
  this_month: "This month",
  last_month: "Last month",
  all: "All time",
};

export type SalesBooking = {
  booking_date: string;
  status: string;
  total_price: number;
  booking_services:
    | {
        price_snapshot: number;
        services: { name: string } | { name: string }[] | null;
      }[]
    | null;
};

const PIPELINE_STATUSES = ["booked", "in_progress", "completed"] as const;
const STAGES = [
  "consulting",
  "rescheduling",
  ...PIPELINE_STATUSES,
  "paid",
] as const;

const currency = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

function inRange(date: string, range: SalesRange, today: string) {
  if (range === "all") return true;
  const month = today.slice(0, 7);
  if (range === "this_month") return date.startsWith(month);
  const d = parseISO(`${month}-01`);
  d.setMonth(d.getMonth() - 1);
  return date.startsWith(format(d, "yyyy-MM"));
}

export function SalesStats({
  bookings,
  range,
  today,
}: {
  bookings: SalesBooking[];
  range: SalesRange;
  today: string;
}) {
  const scoped = bookings.filter((b) => inRange(b.booking_date, range, today));

  const stages = STAGES.map((status) => {
    const rows = scoped.filter((b) => b.status === status);
    return {
      status,
      count: rows.length,
      total: rows.reduce((sum, b) => sum + Number(b.total_price), 0),
    };
  });

  const paid = stages.find((s) => s.status === "paid")!;
  const pipelineTotal = stages
    .filter((s) => (PIPELINE_STATUSES as readonly string[]).includes(s.status))
    .reduce((sum, s) => sum + s.total, 0);
  const avgJob = paid.count ? paid.total / paid.count : 0;

  const byService = new Map<string, number>();
  for (const b of scoped.filter((b) => b.status === "paid")) {
    for (const line of b.booking_services ?? []) {
      const name = getRelation(line.services)?.name ?? "Unknown";
      byService.set(name, (byService.get(name) ?? 0) + Number(line.price_snapshot));
    }
  }
  const serviceRows = [...byService.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxService = serviceRows[0]?.[1] ?? 0;

  const months: { key: string; label: string; total: number }[] = [];
  const base = parseISO(`${today.slice(0, 7)}-01`);
  for (let i = 5; i >= 0; i--) {
    const d = new Date(base);
    d.setMonth(d.getMonth() - i);
    months.push({ key: format(d, "yyyy-MM"), label: format(d, "MMM"), total: 0 });
  }
  for (const b of bookings) {
    if (b.status !== "paid") continue;
    const m = months.find((m) => b.booking_date.startsWith(m.key));
    if (m) m.total += Number(b.total_price);
  }
  const maxMonth = Math.max(...months.map((m) => m.total), 0);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Sales</h2>
        <div className="flex gap-1 rounded-lg border border-white/10 p-1 text-sm">
          {(Object.keys(SALES_RANGE_LABELS) as SalesRange[]).map((key) => (
            <Link
              key={key}
              href={key === "this_month" ? "/admin" : `/admin?range=${key}`}
              className={`rounded-md px-3 py-1 ${
                key === range
                  ? "bg-brand-purple-500/30 text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {SALES_RANGE_LABELS[key]}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stages.map((s) => (
          <Card key={s.status}>
            <CardContent className="pt-0">
              <p className="text-sm text-white/60">
                {BOOKING_STATUS_LABELS[s.status]}
              </p>
              <p className="mt-1 text-2xl font-bold text-white">
                {currency.format(s.total)}
              </p>
              <p className="text-xs text-white/40">
                {s.count} booking{s.count === 1 ? "" : "s"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-white/60">
              Pipeline (Booked + In Progress + Completed)
            </p>
            <p className="mt-1 text-2xl font-bold text-white">
              {currency.format(pipelineTotal)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-white/60">Average paid job</p>
            <p className="mt-1 text-2xl font-bold text-white">
              {currency.format(avgJob)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Paid revenue, last 6 months</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-3">
              {months.map((m) => (
                <div key={m.key} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs text-white/60">
                    {currency.format(m.total)}
                  </span>
                  <div
                    className="w-full rounded-t bg-brand-purple-500/60"
                    style={{
                      height: `${maxMonth ? Math.max((m.total / maxMonth) * 100, m.total ? 4 : 0) : 0}%`,
                    }}
                  />
                  <span className="text-xs text-white/50">{m.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paid revenue by service</CardTitle>
          </CardHeader>
          <CardContent>
            {serviceRows.length ? (
              <ul className="space-y-3">
                {serviceRows.map(([name, total]) => (
                  <li key={name}>
                    <div className="flex justify-between text-sm">
                      <span className="text-white">{name}</span>
                      <span className="text-white/60">{currency.format(total)}</span>
                    </div>
                    <div className="mt-1 h-2 rounded bg-white/10">
                      <div
                        className="h-2 rounded bg-brand-purple-500/60"
                        style={{ width: `${(total / maxService) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/50">No paid bookings in this range.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

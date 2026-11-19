import { requireAdmin } from "@/lib/supabase/admin";
import { getBusinessToday } from "@/lib/utils/dates";
import { parseDateRange } from "@/lib/admin/date-range";
import { PartnerSplitWidget } from "@/components/admin/partner-split-widget";
import { FinancesManager } from "@/components/admin/finances-manager";

export default async function FinancesPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rangeParam } = await searchParams;
  const range = parseDateRange(rangeParam);
  const { supabase } = await requireAdmin();
  const today = getBusinessToday();

  const [{ data: revenue }, { data: expenses }, { data: payouts }] = await Promise.all([
    supabase.from("bookings").select("booking_date, total_price").eq("status", "paid"),
    supabase
      .from("finance_expenses")
      .select("*")
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("partner_payouts")
      .select("*")
      .order("paid_on", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  const invoicePaths = (expenses ?? [])
    .map((e) => e.invoice_path)
    .filter((path): path is string => Boolean(path));
  const invoiceUrls: Record<string, string> = {};
  if (invoicePaths.length) {
    const { data: signed } = await supabase.storage
      .from("expense-invoices")
      .createSignedUrls(invoicePaths, 60 * 60);
    for (const item of signed ?? []) {
      if (item.path && item.signedUrl) invoiceUrls[item.path] = item.signedUrl;
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Finances</h1>
        <p className="mt-1 text-sm text-white/60">
          Expenses, utility bills, invoices and partner payments.
        </p>
      </div>

      <PartnerSplitWidget
        revenue={revenue ?? []}
        expenses={expenses ?? []}
        payouts={payouts ?? []}
        range={range}
        today={today}
        basePath="/admin/finances"
      />

      <FinancesManager
        expenses={expenses ?? []}
        payouts={payouts ?? []}
        invoiceUrls={invoiceUrls}
        today={today}
      />
    </div>
  );
}

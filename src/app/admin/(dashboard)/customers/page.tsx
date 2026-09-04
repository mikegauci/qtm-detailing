import { requireAdmin } from "@/lib/supabase/admin";
import { CustomersManager } from "@/components/admin/customers-manager";

export default async function CustomersPage() {
  const { supabase } = await requireAdmin();

  const { data: customers } = await supabase
    .from("customers")
    .select("*, vehicles(count), bookings(total_price)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <p className="mt-1 text-sm text-white/60">
          {customers?.length ?? 0} customer{customers?.length !== 1 ? "s" : ""}
        </p>
      </div>

      <CustomersManager customers={customers ?? []} />
    </div>
  );
}

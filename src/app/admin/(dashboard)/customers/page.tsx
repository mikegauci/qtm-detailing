import { requireAdmin } from "@/lib/supabase/admin";
import { CustomersManager } from "@/components/admin/customers-manager";

type CustomerRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  vehicles: { count: number }[];
  lifetime_value: number;
  booking_count: number;
};

export default async function CustomersPage() {
  const { supabase } = await requireAdmin();

  const { data: customers } = await supabase
    .from("customers")
    .select("id, full_name, email, phone, created_at, vehicles(count)")
    .order("created_at", { ascending: false });

  const customerIds = customers?.map((customer) => customer.id) ?? [];
  const lifetimeValueByCustomer = new Map<string, number>();
  const bookingCountByCustomer = new Map<string, number>();

  if (customerIds.length > 0) {
    const { data: bookingTotals } = await supabase
      .from("bookings")
      .select("customer_id, total_price")
      .in("customer_id", customerIds);

    for (const booking of bookingTotals ?? []) {
      const current = lifetimeValueByCustomer.get(booking.customer_id) ?? 0;
      lifetimeValueByCustomer.set(
        booking.customer_id,
        current + Number(booking.total_price),
      );
      bookingCountByCustomer.set(
        booking.customer_id,
        (bookingCountByCustomer.get(booking.customer_id) ?? 0) + 1,
      );
    }
  }

  const customersWithTotals: CustomerRow[] =
    customers?.map((customer) => ({
      ...customer,
      lifetime_value: lifetimeValueByCustomer.get(customer.id) ?? 0,
      booking_count: bookingCountByCustomer.get(customer.id) ?? 0,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <p className="mt-1 text-sm text-white/60">
          {customersWithTotals.length} customer
          {customersWithTotals.length !== 1 ? "s" : ""}
        </p>
      </div>

      <CustomersManager customers={customersWithTotals} />
    </div>
  );
}

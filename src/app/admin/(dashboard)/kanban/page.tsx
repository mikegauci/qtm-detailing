import { requireAdmin } from "@/lib/supabase/admin";
import { getCustomerRelation } from "@/lib/admin/supabase-relations";
import { BookingsKanban } from "@/components/admin/bookings-kanban";

export default async function KanbanPage() {
  const { supabase } = await requireAdmin();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, confirmation_code, booking_date, start_time, status, customers(full_name)")
    .order("booking_date", { ascending: true });

  const kanbanBookings =
    bookings?.map((b) => {
      const customer = getCustomerRelation(b.customers);
      return {
        id: b.id,
        confirmation_code: b.confirmation_code,
        booking_date: b.booking_date,
        start_time: b.start_time,
        status: b.status,
        customer_name: customer?.full_name ?? "Unknown",
      };
    }) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Kanban Board</h1>
        <p className="mt-1 text-sm text-white/60">
          Drag bookings between columns to update their status.
        </p>
      </div>

      <BookingsKanban initialBookings={kanbanBookings} />
    </div>
  );
}

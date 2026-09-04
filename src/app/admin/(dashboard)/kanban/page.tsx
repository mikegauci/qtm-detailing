import { requireAdmin } from "@/lib/supabase/admin";
import { getCustomerRelation } from "@/lib/admin/supabase-relations";
import { BookingsKanbanLazy } from "@/components/admin/lazy/bookings-kanban-lazy";

export default async function KanbanPage() {
  const { supabase } = await requireAdmin();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, confirmation_code, booking_date, end_date, status, customers(full_name)")
    .in("status", ["booked", "in_progress", "completed"])
    .order("booking_date", { ascending: true });

  const kanbanBookings =
    bookings?.map((b) => {
      const customer = getCustomerRelation(b.customers);
      return {
        id: b.id,
        confirmation_code: b.confirmation_code,
        booking_date: b.booking_date,
        end_date: b.end_date,
        status: b.status,
        customer_name: customer?.full_name ?? "Unknown",
      };
    }) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Kanban Board</h1>
        <p className="mt-1 text-sm text-white/60">
          Update booking status from each column.
        </p>
      </div>

      <BookingsKanbanLazy initialBookings={kanbanBookings} />
    </div>
  );
}

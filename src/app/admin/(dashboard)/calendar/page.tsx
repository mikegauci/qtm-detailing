import { addDays, format, parseISO } from "date-fns";
import { requireAdmin } from "@/lib/supabase/admin";
import {
  getCustomerRelation,
  getRelation,
} from "@/lib/admin/supabase-relations";
import {
  BookingsCalendar,
  type CalendarEvent,
} from "@/components/admin/bookings-calendar";
import { formatBookingDateRange } from "@/lib/utils/booking";
import { formatBookingVehiclesLabel } from "@/lib/utils/booking-vehicles";

function formatServiceLabel(
  bookingServices:
    | { services: { name: string } | { name: string }[] | null }[]
    | null
    | undefined,
): string | null {
  if (!bookingServices?.length) return null;
  const names = bookingServices
    .map((bs) => getRelation(bs.services)?.name)
    .filter(Boolean);
  return names.length > 0 ? names.join(", ") : null;
}

const STATUS_COLORS: Record<string, string> = {
  booked: "#3b82f6",
  in_progress: "#f59e0b",
  completed: "#10b981",
  paid: "#a855f7",
  cancelled: "#ef4444",
};

export default async function CalendarPage() {
  const { supabase } = await requireAdmin();

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      "id, booking_date, end_date, status, notes, total_price, customers(full_name), booking_vehicles(vehicles(make, model)), booking_services(services(name))",
    )
    .neq("status", "cancelled")
    .order("booking_date", { ascending: true });

  const events: CalendarEvent[] =
    bookings?.map((booking) => {
      const customer = getCustomerRelation(booking.customers);
      const bookingServices = Array.isArray(booking.booking_services)
        ? booking.booking_services
        : [];
      const bookingVehicles = Array.isArray(booking.booking_vehicles)
        ? booking.booking_vehicles
        : [];
      const vehicleLabel = formatBookingVehiclesLabel(bookingVehicles);
      const endDate = booking.end_date ?? booking.booking_date;
      return {
        id: booking.id,
        title: customer?.full_name ?? "Booking",
        start: booking.booking_date,
        end: format(addDays(parseISO(endDate), 1), "yyyy-MM-dd"),
        dateLabel: formatBookingDateRange(
          booking.booking_date,
          booking.end_date,
        ),
        serviceLabel: formatServiceLabel(bookingServices),
        vehicleLabel: vehicleLabel === "—" ? null : vehicleLabel,
        priceLabel:
          Number(booking.total_price) > 0
            ? `€${Number(booking.total_price).toFixed(2)}`
            : null,
        notes: booking.notes?.trim() || null,
        backgroundColor: STATUS_COLORS[booking.status] ?? "#3b82f6",
        borderColor: STATUS_COLORS[booking.status] ?? "#3b82f6",
      };
    }) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Calendar</h1>
        <p className="mt-1 text-sm text-white/60">
          Month and week views of scheduled booking date ranges.
        </p>
      </div>

      <BookingsCalendar events={events} />
    </div>
  );
}

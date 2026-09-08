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
import {
  formatBookingDateRange,
  formatServiceNames,
  formatVehicleLabel,
} from "@/lib/utils/booking";

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
      `
      id,
      booking_date,
      end_date,
      status,
      customers(full_name),
      vehicles(make, model, registration),
      booking_services(services(name))
    `,
    )
    .neq("status", "cancelled")
    .order("booking_date", { ascending: true });

  const events: CalendarEvent[] =
    bookings?.map((booking) => {
      const customer = getCustomerRelation(booking.customers);
      const vehicle = getRelation(booking.vehicles);
      const bookingServices = Array.isArray(booking.booking_services)
        ? booking.booking_services
        : [];
      const services = bookingServices
        .map((entry) => getRelation(entry.services))
        .filter(Boolean);
      const customerName = customer?.full_name ?? "Booking";
      const servicesLabel = formatServiceNames(services);
      const vehicleLabel = formatVehicleLabel(vehicle);
      const endDate = booking.end_date ?? booking.booking_date;

      return {
        id: booking.id,
        title: customerName,
        customerName,
        servicesLabel,
        vehicleLabel,
        start: booking.booking_date,
        end: format(addDays(parseISO(endDate), 1), "yyyy-MM-dd"),
        dateLabel: formatBookingDateRange(
          booking.booking_date,
          booking.end_date,
        ),
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

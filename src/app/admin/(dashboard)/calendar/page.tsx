import { addDays, format, parseISO, startOfWeek } from "date-fns";
import { requireAdmin } from "@/lib/supabase/admin";
import { getRelation } from "@/lib/admin/supabase-relations";
import { syncBookingStatusesFromDates } from "@/lib/admin/sync-booking-statuses";
import {
  BookingsCalendar,
  type CalendarEvent,
} from "@/components/admin/bookings-calendar";
import {
  CALENDAR_STATUS_COLORS,
  formatBookingDateRange,
  getCalendarDisplayStatus,
} from "@/lib/utils/booking";
import { formatBookingVehiclesLabel } from "@/lib/utils/booking-vehicles";
import { getBusinessToday, parseDateKey } from "@/lib/utils/dates";

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

export default async function CalendarPage() {
  const { supabase } = await requireAdmin();
  const today = getBusinessToday();
  const initialWeekStart = format(
    startOfWeek(parseDateKey(today), { weekStartsOn: 0 }),
    "yyyy-MM-dd",
  );

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      "id, booking_date, end_date, status, notes, total_price, customers(full_name), booking_vehicles(vehicles(make, model)), booking_services(services(name))",
    )
    .order("booking_date", { ascending: true });

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="mt-1 text-sm text-white/60">
            Month and week views of scheduled booking date ranges.
          </p>
        </div>
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          Could not load bookings. {error.message}
        </div>
      </div>
    );
  }

  let statusUpdates: Awaited<
    ReturnType<typeof syncBookingStatusesFromDates>
  > = new Map();

  try {
    statusUpdates = await syncBookingStatusesFromDates(
      supabase,
      bookings ?? [],
      today,
    );
  } catch (syncError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="mt-1 text-sm text-white/60">
            Month and week views of scheduled booking date ranges.
          </p>
        </div>
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          Could not sync booking statuses.{" "}
          {syncError instanceof Error ? syncError.message : "Try again."}
        </div>
      </div>
    );
  }

  const events: CalendarEvent[] =
    bookings?.map((booking) => {
      const customer = getRelation(booking.customers);
      const bookingServices = Array.isArray(booking.booking_services)
        ? booking.booking_services
        : [];
      const bookingVehicles = Array.isArray(booking.booking_vehicles)
        ? booking.booking_vehicles
        : [];
      const vehicleLabel = formatBookingVehiclesLabel(bookingVehicles);
      const endDate = booking.end_date ?? booking.booking_date;
      const status = statusUpdates.get(booking.id) ?? booking.status;
      const displayStatus = getCalendarDisplayStatus(
        status,
        booking.booking_date,
        booking.end_date,
        today,
      );
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
        backgroundColor: CALENDAR_STATUS_COLORS[displayStatus] ?? "#3b82f6",
        borderColor: CALENDAR_STATUS_COLORS[displayStatus] ?? "#3b82f6",
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

      <BookingsCalendar
        events={events}
        today={today}
        initialWeekStart={initialWeekStart}
      />
    </div>
  );
}

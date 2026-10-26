import { syncAllBookingStatuses } from "@/lib/admin/sync-booking-statuses";
import { getBusinessToday } from "@/lib/utils/dates";
import { BOOKING_STATUS_LABELS } from "@/lib/utils/booking";
import { BookingsManager } from "@/components/admin/bookings-manager";
import { requireAdmin } from "@/lib/supabase/admin";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const initialStatus =
    status && status in BOOKING_STATUS_LABELS ? status : "all";
  const { supabase } = await requireAdmin();
  await syncAllBookingStatuses(supabase, getBusinessToday());

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, customers(full_name, email, phone), booking_vehicles(vehicles(make, model))")
    .order("booking_date", { ascending: false });

  return (
    <BookingsManager
      key={initialStatus}
      bookings={bookings ?? []}
      initialStatus={initialStatus}
    />
  );
}

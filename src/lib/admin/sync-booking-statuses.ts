import { syncBookingToGoogleCalendar } from "@/lib/google-calendar";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin";
import type { Enums } from "@/lib/supabase/types";
import { getAutoSyncedBookingStatus } from "@/lib/utils/booking";

type BookingStatusRow = {
  id: string;
  status: string;
  booking_date: string;
  end_date: string | null;
};

type BookingSupabase = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

export async function syncBookingStatusesFromDates(
  supabase: BookingSupabase,
  bookings: BookingStatusRow[],
  today: string,
): Promise<Map<string, Enums<"booking_status">>> {
  const updates = new Map<string, Enums<"booking_status">>();

  for (const booking of bookings) {
    const nextStatus = getAutoSyncedBookingStatus(
      booking.status,
      booking.booking_date,
      booking.end_date,
      today,
    );

    if (nextStatus) {
      updates.set(booking.id, nextStatus);
    }
  }

  if (!updates.size) {
    return updates;
  }

  const results = await Promise.all(
    [...updates.entries()].map(([id, status]) =>
      supabase.from("bookings").update({ status }).eq("id", id),
    ),
  );

  const failedUpdate = results.find((result) => result.error);
  if (failedUpdate?.error) {
    throw new Error(failedUpdate.error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/kanban");
  void Promise.all(
    [...updates.keys()].map((id) => syncBookingToGoogleCalendar(id)),
  );

  return updates;
}

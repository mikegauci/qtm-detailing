"use server";

import type { ActionResult } from "@/types/action-result";
import { requireAdmin } from "@/lib/supabase/admin";
import {
  disconnectGoogleCalendarConnection,
  setupSharedCalendar,
  syncAllBookingsToGoogleCalendar,
} from "@/lib/google-calendar";
import { revalidatePath } from "next/cache";

function revalidateCalendarSettings() {
  revalidatePath("/admin/settings/google-calendar");
}

export async function retryGoogleCalendarSetup(): Promise<ActionResult> {
  await requireAdmin();

  try {
    await setupSharedCalendar();
    revalidateCalendarSettings();
    return {
      success: true,
      message: "Shared calendar is ready and shared with both Gmail accounts.",
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Failed to finish Google Calendar setup.",
    };
  }
}

export async function syncExistingGoogleCalendarBookings(): Promise<
  ActionResult<{ synced?: number; failed?: number }>
> {
  await requireAdmin();

  try {
    const result = await syncAllBookingsToGoogleCalendar();
    revalidateCalendarSettings();
    if (result.failed > 0) {
      return {
        success: false,
        message: `Synced ${result.synced} booking${result.synced === 1 ? "" : "s"}, ${result.failed} failed. Check the last error below.`,
        synced: result.synced,
        failed: result.failed,
      };
    }
    return {
      success: true,
      message: `Synced ${result.synced} booking${result.synced === 1 ? "" : "s"} to Google Calendar.`,
      synced: result.synced,
      failed: result.failed,
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Failed to sync bookings to Google Calendar.",
    };
  }
}

export async function disconnectGoogleCalendar(): Promise<ActionResult> {
  await requireAdmin();

  try {
    await disconnectGoogleCalendarConnection();
    revalidateCalendarSettings();
    return {
      success: true,
      message:
        "Google Calendar disconnected. Existing events stay on the QTM Bookings calendar until you delete them in Google.",
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Failed to disconnect Google Calendar.",
    };
  }
}

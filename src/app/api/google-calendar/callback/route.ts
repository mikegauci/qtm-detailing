import { NextResponse } from "next/server";
import {
  exchangeCalendarCode,
  saveCalendarTokens,
  setupSharedCalendar,
} from "@/lib/google-calendar";
import { requireAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/admin/settings/google-calendar?error=${encodeURIComponent(error)}`,
        request.url,
      ),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/admin/settings/google-calendar?error=missing_code", request.url),
    );
  }

  try {
    const tokens = await exchangeCalendarCode(code);
    await saveCalendarTokens(tokens);
    await setupSharedCalendar();
    return NextResponse.redirect(
      new URL("/admin/settings/google-calendar?connected=1", request.url),
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to connect Google Calendar";
    return NextResponse.redirect(
      new URL(
        `/admin/settings/google-calendar?error=${encodeURIComponent(message)}`,
        request.url,
      ),
    );
  }
}

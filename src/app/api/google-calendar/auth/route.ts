import { NextResponse } from "next/server";
import { getCalendarOAuthUrl } from "@/lib/google-calendar";
import { requireAdmin } from "@/lib/supabase/admin";

export async function GET() {
  await requireAdmin();
  const url = getCalendarOAuthUrl("google_calendar");
  return NextResponse.redirect(url);
}

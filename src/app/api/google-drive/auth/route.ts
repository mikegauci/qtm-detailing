import { NextResponse } from "next/server";
import { getOAuthUrl } from "@/lib/google-drive";
import { requireAdmin } from "@/lib/supabase/admin";

export async function GET() {
  await requireAdmin();
  const url = getOAuthUrl("google_drive");
  return NextResponse.redirect(url);
}

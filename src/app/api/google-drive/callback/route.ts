import { NextResponse } from "next/server";
import { exchangeCode, saveDriveTokens } from "@/lib/google-drive";
import { requireAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/admin/settings/google-drive?error=${encodeURIComponent(error)}`,
        request.url,
      ),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/admin/settings/google-drive?error=missing_code", request.url),
    );
  }

  try {
    const tokens = await exchangeCode(code);
    await saveDriveTokens(tokens);
    return NextResponse.redirect(
      new URL("/admin/settings/google-drive?connected=1", request.url),
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to connect Google Drive";
    return NextResponse.redirect(
      new URL(
        `/admin/settings/google-drive?error=${encodeURIComponent(message)}`,
        request.url,
      ),
    );
  }
}

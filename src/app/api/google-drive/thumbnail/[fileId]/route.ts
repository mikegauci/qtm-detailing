import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { getFileThumbnail } from "@/lib/google-drive";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  try {
    await requireAdmin();
    const { fileId } = await params;
    const thumbnail = await getFileThumbnail(fileId);

    if (!thumbnail) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(new Uint8Array(thumbnail.data), {
      headers: {
        "Content-Type": thumbnail.contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}

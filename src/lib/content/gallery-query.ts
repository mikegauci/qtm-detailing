import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type GalleryQueryClient = SupabaseClient<Database>;

export async function queryGalleryPhotoRows(
  supabase: GalleryQueryClient,
  options?: { publishedOnly?: boolean },
) {
  let query = supabase
    .from("gallery_photos")
    .select("*")
    .order("created_at", { ascending: false });

  if (options?.publishedOnly) {
    query = query.eq("publish_to_gallery", true);
  }

  const { data, error } = await query;

  if (error || !data?.length) {
    return [];
  }

  return data;
}

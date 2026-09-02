import type { GalleryPhoto } from "@/types/content";
import { normalizeGalleryPhotoCategory } from "@/lib/content/gallery-categories";
import { parseCarName } from "@/lib/content/parse-car-name";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

function mapRowToPhoto(row: Tables<"job_photos">): GalleryPhoto | null {
  if (!row.photo_url) {
    return null;
  }

  const photoType = row.photo_type === "after" ? "after" : "before";
  const folderName = row.drive_folder_name ?? "";

  return {
    id: row.id,
    imageUrl: row.photo_url,
    photoType,
    category: normalizeGalleryPhotoCategory(row.category),
    carName: folderName ? parseCarName(folderName) : undefined,
    sortOrder: new Date(row.created_at).getTime(),
  };
}

async function fetchPublishedPhotos(): Promise<Tables<"job_photos">[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_photos")
    .select("*")
    .eq("publish_to_gallery", true)
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return [];
  }

  return data;
}

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  const rows = await fetchPublishedPhotos();
  return rows
    .map(mapRowToPhoto)
    .filter((photo): photo is GalleryPhoto => photo !== null);
}

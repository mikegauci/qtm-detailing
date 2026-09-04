import type { GalleryPhoto } from "@/types/content";
import { CMS_CACHE_TAGS } from "@/lib/content/cache-tags";
import { createCmsCache } from "@/lib/content/create-cms-cache";
import { normalizeGalleryPhotoCategory } from "@/lib/content/gallery-categories";
import { galleryPhotoDisplayUrl } from "@/lib/cms/gallery-photo-url";
import { parseCarName } from "@/lib/content/parse-car-name";
import { queryGalleryPhotoRows } from "@/lib/content/gallery-query";
import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/lib/supabase/types";

function mapRowToPhoto(row: Tables<"gallery_photos">): GalleryPhoto | null {
  if (!row.photo_url) {
    return null;
  }

  const photoType = row.photo_type === "after" ? "after" : "before";
  const folderName = row.drive_folder_name ?? "";

  return {
    id: row.id,
    imageUrl: galleryPhotoDisplayUrl(row.photo_url, row.ai_enhanced_at),
    photoType,
    category: normalizeGalleryPhotoCategory(row.category),
    carName: folderName ? parseCarName(folderName) : undefined,
    sortOrder: new Date(row.created_at).getTime(),
  };
}

async function fetchPublishedPhotos(): Promise<GalleryPhoto[]> {
  const supabase = createPublicClient();
  const rows = await queryGalleryPhotoRows(supabase, { publishedOnly: true });

  return rows
    .map(mapRowToPhoto)
    .filter((photo): photo is GalleryPhoto => photo !== null);
}

const getGalleryPhotosCached = createCmsCache(
  CMS_CACHE_TAGS.gallery,
  [],
  fetchPublishedPhotos,
);

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  return getGalleryPhotosCached();
}

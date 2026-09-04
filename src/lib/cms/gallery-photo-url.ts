import type { Tables } from "@/lib/supabase/types";
import { parseCarName } from "@/lib/content/parse-car-name";

type GalleryPhoto = Tables<"gallery_photos">;

/** Append a cache-buster so re-uploads to the same storage path refresh in browsers/CDN. */
export function galleryPhotoDisplayUrl(
  photoUrl: string,
  version?: string | null,
): string {
  const base = photoUrl.split("?")[0];
  const existingVersion = photoUrl.match(/[?&]v=(\d+)/)?.[1];
  if (existingVersion) {
    return `${base}?v=${existingVersion}`;
  }
  if (version) {
    return `${base}?v=${new Date(version).getTime()}`;
  }
  return photoUrl;
}

export function withCacheBuster(publicUrl: string): string {
  const base = publicUrl.split("?")[0];
  return `${base}?v=${Date.now()}`;
}

export function getLinkedPhotoDisplaySrc(photo: GalleryPhoto): string | null {
  if (photo.publish_to_gallery && photo.photo_url) {
    return galleryPhotoDisplayUrl(photo.photo_url, photo.ai_enhanced_at);
  }

  if (photo.drive_file_id) {
    return `/api/google-drive/thumbnail/${photo.drive_file_id}`;
  }

  return null;
}

export function getLinkedPhotoLabel(photo: GalleryPhoto): string {
  return photo.drive_folder_name
    ? parseCarName(photo.drive_folder_name)
    : "Linked photo";
}

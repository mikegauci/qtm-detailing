import type { Tables } from "@/lib/supabase/types";

type GalleryPhotoRow = Tables<"gallery_photos">;

function shouldPreferLinkedPhoto(
  next: GalleryPhotoRow,
  existing: GalleryPhotoRow,
): boolean {
  if (next.publish_to_gallery && !existing.publish_to_gallery) {
    return true;
  }
  if (!next.publish_to_gallery && existing.publish_to_gallery) {
    return false;
  }
  return next.created_at > existing.created_at;
}

export function buildLinkedPhotosByDriveId(
  photos: GalleryPhotoRow[],
): Map<string, GalleryPhotoRow> {
  const map = new Map<string, GalleryPhotoRow>();
  for (const photo of photos) {
    if (!photo.drive_file_id) {
      continue;
    }
    const existing = map.get(photo.drive_file_id);
    if (!existing || shouldPreferLinkedPhoto(photo, existing)) {
      map.set(photo.drive_file_id, photo);
    }
  }
  return map;
}

export function isDriveFilePublished(
  linkedPhotosByDriveId: Map<string, GalleryPhotoRow>,
  driveFileId: string,
): boolean {
  return linkedPhotosByDriveId.get(driveFileId)?.publish_to_gallery === true;
}

import { downloadFile } from "@/lib/google-drive";
import type { Tables } from "@/lib/supabase/types";

type GalleryPhotoSource = Pick<
  Tables<"gallery_photos">,
  "photo_url" | "drive_file_id" | "publish_to_gallery"
>;

/** Load image bytes using the same source priority as the admin photo picker. */
export async function loadGalleryPhotoBuffer(
  photo: GalleryPhotoSource,
): Promise<Buffer> {
  if (photo.publish_to_gallery && photo.photo_url) {
    const response = await fetch(photo.photo_url);
    if (!response.ok) {
      throw new Error("Failed to load linked photo.");
    }
    return Buffer.from(await response.arrayBuffer());
  }

  if (photo.drive_file_id) {
    return downloadFile(photo.drive_file_id);
  }

  if (photo.photo_url) {
    const response = await fetch(photo.photo_url);
    if (!response.ok) {
      throw new Error("Failed to load linked photo.");
    }
    return Buffer.from(await response.arrayBuffer());
  }

  throw new Error("Linked photo has no image source.");
}

"use server";

import { revalidatePath } from "next/cache";
import { revalidateGalleryContent } from "@/lib/content/revalidate-cms";
import { queryGalleryPhotoRows, type GalleryQueryClient } from "@/lib/content/gallery-query";
import { processImageBuffer, type ImageProcessingOptions } from "@/lib/cms/process-image";
import { withCacheBuster } from "@/lib/cms/gallery-photo-url";
import {
  DRIVE_CONNECTION_EXPIRED_MESSAGE,
  DriveConnectionExpiredError,
  downloadFile,
} from "@/lib/google-drive";
import type { ActionResult } from "@/types/action-result";
import type {
  DriveFolder,
  DriveImage,
  DriveQueryResult,
} from "@/types/drive";
import { requireAdmin } from "@/lib/supabase/admin";

function toDriveQueryResult<T>(
  fn: () => Promise<T>,
): Promise<DriveQueryResult<T>> {
  return fn()
    .then((data) => ({ success: true as const, data }))
    .catch((err) => {
      if (err instanceof DriveConnectionExpiredError) {
        return {
          success: false as const,
          message: DRIVE_CONNECTION_EXPIRED_MESSAGE,
          expired: true,
        };
      }

      return {
        success: false as const,
        message:
          err instanceof Error ? err.message : "Google Drive request failed.",
      };
    });
}

type GalleryActionResult = ActionResult<{
  photoId?: string;
  alreadyLinked?: boolean;
  alreadyPublished?: boolean;
}>;

export async function linkDrivePhoto(input: {
  driveFileId: string;
  driveFolderId: string;
  driveFolderName: string;
  photoType: "before" | "after";
  category?: string;
}): Promise<GalleryActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { data: existingPhotos, error: lookupError } = await supabase
      .from("gallery_photos")
      .select("id, publish_to_gallery, created_at")
      .eq("drive_file_id", input.driveFileId)
      .order("publish_to_gallery", { ascending: false })
      .order("created_at", { ascending: false });

    if (lookupError) {
      return { success: false, message: lookupError.message };
    }

    const existing = existingPhotos?.[0];
    const metadata = {
      drive_folder_id: input.driveFolderId,
      drive_folder_name: input.driveFolderName,
      photo_type: input.photoType,
      category: input.category ?? "exterior",
    };

    if (existing) {
      const { error: updateError } = await supabase
        .from("gallery_photos")
        .update(metadata)
        .eq("id", existing.id);

      if (updateError) {
        return { success: false, message: updateError.message };
      }

      revalidatePath("/admin/gallery");

      if (existing.publish_to_gallery) {
        return {
          success: true,
          photoId: existing.id,
          alreadyLinked: true,
          alreadyPublished: true,
          message: "Photo is already published to the gallery.",
        };
      }

      return {
        success: true,
        photoId: existing.id,
        alreadyLinked: true,
        message: "Photo is already linked. Metadata updated.",
      };
    }

    const { data: photo, error } = await supabase
      .from("gallery_photos")
      .insert({
        drive_file_id: input.driveFileId,
        ...metadata,
        photo_url: "",
        publish_to_gallery: false,
      })
      .select("id")
      .single();

    if (error || !photo) {
      return { success: false, message: error?.message ?? "Failed to link photo." };
    }

    revalidatePath("/admin/gallery");
    return { success: true, message: "Photo linked from Google Drive.", photoId: photo.id };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to link photo.",
    };
  }
}

export async function publishAllPhotos(
  photoIds: string[],
  options?: ImageProcessingOptions,
): Promise<GalleryActionResult> {
  if (photoIds.length === 0) {
    return { success: false, message: "No photos to publish." };
  }

  let published = 0;
  const errors: string[] = [];

  for (const photoId of photoIds) {
    const result = await publishPhoto(photoId, options);
    if (result.success) {
      published += 1;
    } else {
      errors.push(result.message);
    }
  }

  if (published === 0) {
    return {
      success: false,
      message: errors[0] ?? "Failed to publish photos.",
    };
  }

  if (errors.length > 0) {
    return {
      success: true,
      message: `Published ${published} of ${photoIds.length} photos. Some failed.`,
    };
  }

  return {
    success: true,
    message:
      published === 1
        ? "Photo published to gallery."
        : `Published ${published} photos to gallery.`,
  };
}

export async function publishPhoto(
  photoId: string,
  options?: ImageProcessingOptions,
): Promise<GalleryActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { data: photo, error: fetchError } = await supabase
      .from("gallery_photos")
      .select("*")
      .eq("id", photoId)
      .single();

    if (fetchError || !photo) {
      return { success: false, message: "Photo not found." };
    }

    if (!photo.drive_file_id) {
      return { success: false, message: "Photo is not linked to Google Drive." };
    }

    const raw = await downloadFile(photo.drive_file_id);
    const optimized = await processImageBuffer(raw, options);

    const storagePath = `gallery/${photoId}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("gallery-photos")
      .upload(storagePath, optimized, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      return { success: false, message: uploadError.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("gallery-photos").getPublicUrl(storagePath);

    const usesAi =
      options?.enhance === true || options?.blankPlate === true;

    const { error: updateError } = await supabase
      .from("gallery_photos")
      .update({
        storage_path: storagePath,
        photo_url: withCacheBuster(publicUrl),
        publish_to_gallery: true,
        ...(usesAi ? { ai_enhanced_at: new Date().toISOString() } : {}),
      })
      .eq("id", photoId);

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    revalidatePath("/admin/gallery");
    revalidateGalleryContent();
    return { success: true, message: "Photo published to gallery." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to publish photo.",
    };
  }
}

export async function updatePhotoMetadata(input: {
  photoId: string;
  photoType: "before" | "after";
  category: string;
}): Promise<GalleryActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("gallery_photos")
      .update({
        photo_type: input.photoType,
        category: input.category,
      })
      .eq("id", input.photoId);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/gallery");
    revalidateGalleryContent();
    return { success: true, message: "Photo updated." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to update photo.",
    };
  }
}

export async function unpublishPhoto(photoId: string): Promise<GalleryActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("gallery_photos")
      .update({ publish_to_gallery: false })
      .eq("id", photoId);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/gallery");
    revalidateGalleryContent();
    return { success: true, message: "Photo removed from public gallery." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to unpublish photo.",
    };
  }
}

export async function deletePhoto(photoId: string): Promise<GalleryActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { data: photo } = await supabase
      .from("gallery_photos")
      .select("storage_path")
      .eq("id", photoId)
      .maybeSingle();

    if (photo?.storage_path) {
      await supabase.storage
        .from("gallery-photos")
        .remove([photo.storage_path]);
    }

    const { error } = await supabase
      .from("gallery_photos")
      .delete()
      .eq("id", photoId);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/gallery");
    revalidateGalleryContent();
    return { success: true, message: "Photo deleted." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to delete photo.",
    };
  }
}

export async function listDriveFolders(
  parentId?: string,
): Promise<DriveQueryResult<DriveFolder[]>> {
  const { listFolders } = await import("@/lib/google-drive");
  await requireAdmin();
  return toDriveQueryResult(() => listFolders(parentId));
}

export async function listDriveImages(
  folderId: string,
): Promise<DriveQueryResult<DriveImage[]>> {
  const { listImagesInFolder } = await import("@/lib/google-drive");
  await requireAdmin();
  return toDriveQueryResult(() => listImagesInFolder(folderId));
}

export async function findDriveRootFolder(): Promise<
  DriveQueryResult<DriveFolder | null>
> {
  const { findFolderByPath, getDriveRootFolderName } = await import(
    "@/lib/google-drive"
  );
  await requireAdmin();
  return toDriveQueryResult(() => findFolderByPath(getDriveRootFolderName()));
}

export async function getGalleryPhotos(supabase?: GalleryQueryClient) {
  const client = supabase ?? (await requireAdmin()).supabase;
  return queryGalleryPhotoRows(client);
}

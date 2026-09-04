"use server";

import { revalidatePath } from "next/cache";
import { processImageBuffer, type ImageProcessingOptions } from "@/lib/cms/process-image";
import { downloadFile } from "@/lib/google-drive";
import { requireAdmin } from "@/lib/supabase/admin";

export type ActionResult = {
  success: boolean;
  message: string;
  photoId?: string;
};

export async function linkDrivePhoto(input: {
  driveFileId: string;
  driveFolderId: string;
  driveFolderName: string;
  photoType: "before" | "after";
  category?: string;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { data: photo, error } = await supabase
      .from("gallery_photos")
      .insert({
        drive_file_id: input.driveFileId,
        drive_folder_id: input.driveFolderId,
        drive_folder_name: input.driveFolderName,
        photo_type: input.photoType,
        category: input.category ?? "exterior",
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

export async function linkAndPublishDrivePhotos(input: {
  driveFileIds: string[];
  driveFolderId: string;
  driveFolderName: string;
  photoType: "before" | "after";
  category?: string;
  enhance?: boolean;
  blankPlate?: boolean;
}): Promise<ActionResult> {
  if (input.driveFileIds.length === 0) {
    return { success: false, message: "No photos selected." };
  }

  let published = 0;
  const errors: string[] = [];

  for (const driveFileId of input.driveFileIds) {
    const linkResult = await linkDrivePhoto({
      driveFileId,
      driveFolderId: input.driveFolderId,
      driveFolderName: input.driveFolderName,
      photoType: input.photoType,
      category: input.category,
    });

    if (!linkResult.success || !linkResult.photoId) {
      errors.push(linkResult.message);
      continue;
    }

    const publishResult = await publishPhoto(linkResult.photoId, {
      enhance: input.enhance,
      blankPlate: input.blankPlate,
    });
    if (publishResult.success) {
      published += 1;
    } else {
      await deletePhoto(linkResult.photoId);
      errors.push(publishResult.message);
    }
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");

  if (published === 0) {
    return {
      success: false,
      message: errors[0] ?? "Failed to publish photos.",
    };
  }

  if (errors.length > 0) {
    return {
      success: true,
      message: `Published ${published} of ${input.driveFileIds.length} photos. Some failed.`,
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

export async function publishAllPhotos(
  photoIds: string[],
  options?: ImageProcessingOptions,
): Promise<ActionResult> {
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
): Promise<ActionResult> {
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

    const { error: updateError } = await supabase
      .from("gallery_photos")
      .update({
        storage_path: storagePath,
        photo_url: publicUrl,
        publish_to_gallery: true,
      })
      .eq("id", photoId);

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
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
}): Promise<ActionResult> {
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
    revalidatePath("/gallery");
    return { success: true, message: "Photo updated." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to update photo.",
    };
  }
}

export async function unpublishPhoto(photoId: string): Promise<ActionResult> {
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
    revalidatePath("/gallery");
    return { success: true, message: "Photo removed from public gallery." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to unpublish photo.",
    };
  }
}

export async function deletePhoto(photoId: string): Promise<ActionResult> {
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
    revalidatePath("/gallery");
    return { success: true, message: "Photo deleted." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to delete photo.",
    };
  }
}

export async function listDriveFolders(parentId?: string) {
  const { listFolders } = await import("@/lib/google-drive");
  await requireAdmin();
  return listFolders(parentId);
}

export async function listDriveImages(folderId: string) {
  const { listImagesInFolder } = await import("@/lib/google-drive");
  await requireAdmin();
  return listImagesInFolder(folderId);
}

export async function findDriveRootFolder() {
  const { findFolderByName, getDriveRootFolderName } = await import(
    "@/lib/google-drive"
  );
  await requireAdmin();
  return findFolderByName(getDriveRootFolderName());
}

export async function getGalleryPhotos() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("gallery_photos")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

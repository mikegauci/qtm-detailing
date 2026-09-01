"use server";

import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { downloadFile } from "@/lib/google-drive";
import { requireAdmin } from "@/lib/supabase/admin";

export type ActionResult = {
  success: boolean;
  message: string;
};

const GALLERY_CUSTOMER_EMAIL = "gallery@qtmdetailing.internal";

async function getGalleryBookingId(supabase: Awaited<
  ReturnType<typeof requireAdmin>
>["supabase"]) {
  const { data: existingPhoto } = await supabase
    .from("job_photos")
    .select("booking_id")
    .not("booking_id", "is", null)
    .limit(1)
    .maybeSingle();

  if (existingPhoto?.booking_id) {
    return existingPhoto.booking_id;
  }

  let customerId: string;
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("email", GALLERY_CUSTOMER_EMAIL)
    .maybeSingle();

  if (existingCustomer?.id) {
    customerId = existingCustomer.id;
  } else {
    const { data: customer, error } = await supabase
      .from("customers")
      .insert({
        email: GALLERY_CUSTOMER_EMAIL,
        full_name: "Gallery Placeholder",
      })
      .select("id")
      .single();

    if (error || !customer) {
      throw new Error("Could not create gallery customer.");
    }
    customerId = customer.id;
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      customer_id: customerId,
      booking_date: today,
      start_time: "09:00",
      end_time: "17:00",
      confirmation_code: "GALLERY",
      status: "completed",
      total_price: 0,
    })
    .select("id")
    .single();

  if (bookingError || !booking) {
    throw new Error("Could not create gallery booking.");
  }

  return booking.id;
}

export async function linkDrivePhoto(input: {
  driveFileId: string;
  driveFolderId: string;
  photoType: "before" | "after";
  title: string;
  category?: string;
  description?: string;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const bookingId = await getGalleryBookingId(supabase);

    const { error } = await supabase.from("job_photos").insert({
      booking_id: bookingId,
      drive_file_id: input.driveFileId,
      drive_folder_id: input.driveFolderId,
      photo_type: input.photoType,
      title: input.title,
      category: input.category ?? "exterior",
      description: input.description ?? null,
      photo_url: "",
      publish_to_gallery: false,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/gallery");
    return { success: true, message: "Photo linked from Google Drive." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to link photo.",
    };
  }
}

export async function publishPhoto(photoId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { data: photo, error: fetchError } = await supabase
      .from("job_photos")
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
    const optimized = await sharp(raw)
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();

    const storagePath = `gallery/${photoId}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("job-photos")
      .upload(storagePath, optimized, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      return { success: false, message: uploadError.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("job-photos").getPublicUrl(storagePath);

    const { error: updateError } = await supabase
      .from("job_photos")
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

export async function unpublishPhoto(photoId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("job_photos")
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
      .from("job_photos")
      .select("storage_path")
      .eq("id", photoId)
      .maybeSingle();

    if (photo?.storage_path) {
      await supabase.storage
        .from("job-photos")
        .remove([photo.storage_path]);
    }

    const { error } = await supabase
      .from("job_photos")
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
    .from("job_photos")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

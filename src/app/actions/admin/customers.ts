"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  CMS_ASSETS_BUCKET,
  cmsAssetStoragePath,
  optimizeCmsImage,
} from "@/lib/cms/upload-cms-asset";
import { downloadFile, isDriveConnected } from "@/lib/google-drive";
import { requireAdmin } from "@/lib/supabase/admin";
import type { Tables } from "@/lib/supabase/types";

export type ActionResult = {
  success: boolean;
  message: string;
  id?: string;
};

const createCustomerSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .optional(),
    phone: z.string().optional(),
  })
  .refine(
    (data) => {
      const hasEmail = Boolean(data.email?.trim());
      const hasPhone = Boolean(data.phone?.trim());
      return hasEmail || hasPhone;
    },
    {
      message: "Phone or email is required.",
      path: ["phone"],
    },
  );

function normalizeOptionalString(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export async function createCustomer(data: {
  full_name: string;
  email?: string | null;
  phone?: string | null;
}): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const parsed = createCustomerSchema.safeParse({
    full_name: data.full_name,
    email: normalizeOptionalString(data.email),
    phone: normalizeOptionalString(data.phone),
  });

  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Invalid customer details.";
    return { success: false, message };
  }

  const { full_name, email, phone } = parsed.data;

  const { data: customer, error } = await supabase
    .from("customers")
    .insert({
      full_name,
      email: email ?? null,
      phone: phone ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/customers");
  revalidatePath("/admin/bookings/new");
  return { success: true, message: "Customer created.", id: customer.id };
}

export async function updateCustomer(
  id: string,
  data: {
    full_name?: string;
    email?: string | null;
    phone?: string | null;
  },
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("customers").update(data).eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
  return { success: true, message: "Customer updated." };
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { data: customer, error: fetchError } = await supabase
    .from("customers")
    .select("email, phone")
    .eq("id", id)
    .single();

  if (fetchError || !customer) {
    return { success: false, message: fetchError?.message ?? "Customer not found." };
  }

  const { error: bookingsError } = await supabase
    .from("bookings")
    .delete()
    .eq("customer_id", id);

  if (bookingsError) {
    return { success: false, message: bookingsError.message };
  }

  const { error } = await supabase.from("customers").delete().eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  if (customer.email) {
    await supabase
      .from("leads")
      .update({ status: "contacted" })
      .eq("email", customer.email)
      .eq("status", "converted");
  } else if (customer.phone) {
    await supabase
      .from("leads")
      .update({ status: "contacted" })
      .eq("phone", customer.phone)
      .eq("status", "converted");
  }

  revalidatePath("/admin/customers");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/kanban");
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { success: true, message: "Customer and all related data deleted." };
}

export async function createVehicle(data: {
  customer_id: string;
  make?: string | null;
  model?: string | null;
  registration?: string | null;
  vehicle_type?: string | null;
}): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .insert(data)
    .select("id")
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${data.customer_id}`);
  return { success: true, message: "Vehicle added.", id: vehicle.id };
}

export async function updateVehicle(
  id: string,
  customerId: string,
  data: {
    make?: string | null;
    model?: string | null;
    registration?: string | null;
    vehicle_type?: string | null;
  },
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("vehicles").update(data).eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(`/admin/customers/${customerId}`);
  return { success: true, message: "Vehicle updated." };
}

export async function deleteVehicle(
  id: string,
  customerId: string,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("vehicles").delete().eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(`/admin/customers/${customerId}`);
  return { success: true, message: "Vehicle removed." };
}

async function saveVehiclePhotoBuffer(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  vehicleId: string,
  customerId: string,
  buffer: Buffer,
): Promise<ActionResult & { url?: string }> {
  const { data: vehicle, error: fetchError } = await supabase
    .from("vehicles")
    .select("storage_path")
    .eq("id", vehicleId)
    .eq("customer_id", customerId)
    .single();

  if (fetchError || !vehicle) {
    return { success: false, message: "Vehicle not found." };
  }

  const storagePath = cmsAssetStoragePath("vehicles", `${vehicleId}.jpg`);
  const optimized = await optimizeCmsImage(buffer);

  const { error: uploadError } = await supabase.storage
    .from(CMS_ASSETS_BUCKET)
    .upload(storagePath, optimized, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    return { success: false, message: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(CMS_ASSETS_BUCKET).getPublicUrl(storagePath);

  const { error: updateError } = await supabase
    .from("vehicles")
    .update({
      photo_url: publicUrl,
      storage_path: storagePath,
    })
    .eq("id", vehicleId);

  if (updateError) {
    return { success: false, message: updateError.message };
  }

  if (vehicle.storage_path && vehicle.storage_path !== storagePath) {
    await supabase.storage
      .from(CMS_ASSETS_BUCKET)
      .remove([vehicle.storage_path]);
  }

  revalidatePath(`/admin/customers/${customerId}`);
  return { success: true, message: "Vehicle photo updated.", url: publicUrl };
}

export async function getLinkedPhotosForPicker(): Promise<{
  success: boolean;
  message?: string;
  photos: Tables<"gallery_photos">[];
}> {
  const { supabase } = await requireAdmin();

  const { data: photos, error } = await supabase
    .from("gallery_photos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, message: error.message, photos: [] };
  }

  return { success: true, photos: photos ?? [] };
}

export async function getDrivePickerState(): Promise<{
  connected: boolean;
}> {
  await requireAdmin();
  return { connected: await isDriveConnected() };
}

export async function setVehiclePhotoFromDrive(
  vehicleId: string,
  customerId: string,
  driveFileId: string,
): Promise<ActionResult & { url?: string }> {
  try {
    const { supabase } = await requireAdmin();
    const buffer = await downloadFile(driveFileId);
    return saveVehiclePhotoBuffer(supabase, vehicleId, customerId, buffer);
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Failed to use Google Drive photo.",
    };
  }
}

export async function setVehiclePhotoFromLinked(
  vehicleId: string,
  customerId: string,
  galleryPhotoId: string,
): Promise<ActionResult & { url?: string }> {
  try {
    const { supabase } = await requireAdmin();

    const { data: photo, error: fetchError } = await supabase
      .from("gallery_photos")
      .select("*")
      .eq("id", galleryPhotoId)
      .single();

    if (fetchError || !photo) {
      return { success: false, message: "Linked photo not found." };
    }

    let buffer: Buffer;
    if (photo.photo_url) {
      const response = await fetch(photo.photo_url);
      if (!response.ok) {
        return { success: false, message: "Failed to load linked photo." };
      }
      buffer = Buffer.from(await response.arrayBuffer());
    } else if (photo.drive_file_id) {
      buffer = await downloadFile(photo.drive_file_id);
    } else {
      return { success: false, message: "Linked photo has no image source." };
    }

    return saveVehiclePhotoBuffer(supabase, vehicleId, customerId, buffer);
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Failed to use linked photo.",
    };
  }
}

export async function uploadVehiclePhoto(
  vehicleId: string,
  customerId: string,
  formData: FormData,
): Promise<ActionResult & { url?: string }> {
  try {
    const { supabase } = await requireAdmin();

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { success: false, message: "No image file provided." };
    }

    if (!file.type.startsWith("image/")) {
      return { success: false, message: "File must be an image." };
    }

    return saveVehiclePhotoBuffer(
      supabase,
      vehicleId,
      customerId,
      Buffer.from(await file.arrayBuffer()),
    );
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to upload photo.",
    };
  }
}

export async function removeVehiclePhoto(
  vehicleId: string,
  customerId: string,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { data: vehicle, error: fetchError } = await supabase
    .from("vehicles")
    .select("storage_path")
    .eq("id", vehicleId)
    .eq("customer_id", customerId)
    .single();

  if (fetchError || !vehicle) {
    return { success: false, message: "Vehicle not found." };
  }

  if (vehicle.storage_path) {
    await supabase.storage
      .from(CMS_ASSETS_BUCKET)
      .remove([vehicle.storage_path]);
  }

  const { error } = await supabase
    .from("vehicles")
    .update({ photo_url: null, storage_path: null })
    .eq("id", vehicleId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(`/admin/customers/${customerId}`);
  return { success: true, message: "Vehicle photo removed." };
}

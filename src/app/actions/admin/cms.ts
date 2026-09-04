"use server";

import { revalidatePath } from "next/cache";
import {
  CMS_ASSETS_BUCKET,
  cmsAssetStoragePath,
  optimizeCmsImage,
} from "@/lib/cms/upload-cms-asset";
import { defaultSiteConfig } from "@/lib/content/cms-defaults";
import { requireAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";
import type { ServiceImage } from "@/types/content";
import { slugify } from "@/lib/utils";

export type ActionResult = {
  success: boolean;
  message: string;
};

export type UploadCmsAssetResult = ActionResult & {
  url?: string;
};

export async function uploadCmsAsset(formData: FormData): Promise<UploadCmsAssetResult> {
  try {
    const { supabase } = await requireAdmin();

    const file = formData.get("file");
    const folder = String(formData.get("folder") ?? "misc");
    const filename = String(formData.get("filename") ?? "");

    if (!(file instanceof File) || file.size === 0) {
      return { success: false, message: "No image file provided." };
    }

    if (!file.type.startsWith("image/")) {
      return { success: false, message: "File must be an image." };
    }

    const baseName =
      filename ||
      file.name.replace(/\.[^.]+$/, "") ||
      `asset-${Date.now()}`;
    const storagePath = cmsAssetStoragePath(folder, `${baseName}.jpg`);
    const optimized = await optimizeCmsImage(Buffer.from(await file.arrayBuffer()));

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

    return { success: true, message: "Image uploaded.", url: publicUrl };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to upload image.",
    };
  }
}

function revalidateContent() {
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/gallery");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/admin");
  revalidatePath("/admin/content/site-settings");
  revalidatePath("/admin/content/services");
  revalidatePath("/admin/content/testimonials");
  revalidatePath("/admin/content/faqs");
  revalidatePath("/admin/content/page-copy");
}

export async function upsertSiteSettings(
  value: Json,
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("site_settings").upsert({
      key: "main",
      value,
      updated_at: new Date().toISOString(),
    });

    if (error) return { success: false, message: error.message };
    revalidateContent();
    return { success: true, message: "Site settings saved." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to save settings.",
    };
  }
}

export async function upsertService(input: {
  id?: string;
  name: string;
  short_description?: string;
  description?: string;
  features?: string[];
  images?: ServiceImage[];
  category?: string;
  is_active?: boolean;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const images = input.images ?? [];
    const payload = {
      name: input.name,
      slug: slugify(input.name),
      short_description: input.short_description ?? null,
      description: input.description ?? null,
      price: 0,
      price_suv: 0,
      price_van: 0,
      estimated_duration_minutes: 0,
      features: input.features ?? [],
      images: images as unknown as Json,
      image_url: images[0]?.url ?? null,
      category: input.category ?? null,
      is_active: input.is_active ?? true,
    };

    if (input.id) {
      const { error } = await supabase
        .from("services")
        .update(payload)
        .eq("id", input.id);

      if (error) return { success: false, message: error.message };
    } else {
      const { data: lastService } = await supabase
        .from("services")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { error } = await supabase.from("services").insert({
        ...payload,
        sort_order: (lastService?.sort_order ?? -1) + 1,
      });

      if (error) return { success: false, message: error.message };
    }

    revalidateContent();
    return { success: true, message: "Service saved." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to save service.",
    };
  }
}

export async function reorderServices(
  orderedIds: string[],
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const results = await Promise.all(
      orderedIds.map((id, index) =>
        supabase.from("services").update({ sort_order: index }).eq("id", id),
      ),
    );

    const error = results.find((result) => result.error)?.error;
    if (error) return { success: false, message: error.message };

    revalidateContent();
    return { success: true, message: "Services reordered." };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Failed to reorder services.",
    };
  }
}

export async function deleteService(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return { success: false, message: error.message };
    revalidateContent();
    return { success: true, message: "Service deleted." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to delete service.",
    };
  }
}

export async function upsertFaq(input: {
  id?: string;
  question: string;
  answer: string;
  category?: string;
  sort_order?: number;
  is_active?: boolean;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const payload = {
      question: input.question,
      answer: input.answer,
      category: input.category ?? null,
      sort_order: input.sort_order ?? 0,
      is_active: input.is_active ?? true,
    };

    const { error } = input.id
      ? await supabase.from("faqs").update(payload).eq("id", input.id)
      : await supabase.from("faqs").insert(payload);

    if (error) return { success: false, message: error.message };
    revalidateContent();
    return { success: true, message: "FAQ saved." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to save FAQ.",
    };
  }
}

export async function deleteFaq(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (error) return { success: false, message: error.message };
    revalidateContent();
    return { success: true, message: "FAQ deleted." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to delete FAQ.",
    };
  }
}

export async function upsertTestimonial(input: {
  id?: string;
  customer_name: string;
  vehicle?: string;
  comment: string;
  rating: number;
  is_published?: boolean;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const payload = {
      customer_name: input.customer_name,
      vehicle: input.vehicle ?? null,
      comment: input.comment,
      rating: input.rating,
      is_published: input.is_published ?? true,
    };

    const { error } = input.id
      ? await supabase.from("reviews").update(payload).eq("id", input.id)
      : await supabase.from("reviews").insert(payload);

    if (error) return { success: false, message: error.message };
    revalidateContent();
    return { success: true, message: "Testimonial saved." };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Failed to save testimonial.",
    };
  }
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return { success: false, message: error.message };
    revalidateContent();
    return { success: true, message: "Testimonial deleted." };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Failed to delete testimonial.",
    };
  }
}

export async function upsertPageSection(input: {
  page_key: string;
  section_key: string;
  content: Json;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("page_sections").upsert(
      {
        page_key: input.page_key,
        section_key: input.section_key,
        content: input.content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "page_key,section_key" },
    );

    if (error) return { success: false, message: error.message };
    revalidateContent();
    return { success: true, message: "Page section saved." };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Failed to save page section.",
    };
  }
}

export async function getAdminServices() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getAdminFaqs() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getAdminTestimonials() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAdminSiteSettings() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "main")
    .maybeSingle();
  return (data?.value as Record<string, unknown> | null) ?? defaultSiteConfig;
}

export async function getAdminPageSections(pageKey?: string) {
  const { supabase } = await requireAdmin();
  let query = supabase.from("page_sections").select("*").order("page_key");

  if (pageKey) {
    query = query.eq("page_key", pageKey);
  }

  const { data } = await query;
  return data ?? [];
}

"use server";

import { revalidatePath } from "next/cache";
import { defaultSiteConfig } from "@/lib/content/cms-defaults";
import { requireAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";

export type ActionResult = {
  success: boolean;
  message: string;
};

function revalidateContent() {
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/gallery");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/admin");
  revalidatePath("/admin/content/site-settings");
  revalidatePath("/admin/content/services");
  revalidatePath("/admin/content/packages");
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
  slug: string;
  short_description?: string;
  description?: string;
  featured?: boolean;
  features?: string[];
  image_url?: string;
  category?: string;
  is_active?: boolean;
  sort_order?: number;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const payload = {
      name: input.name,
      slug: input.slug,
      short_description: input.short_description ?? null,
      description: input.description ?? null,
      price: 0,
      price_suv: 0,
      price_van: 0,
      estimated_duration_minutes: 0,
      featured: input.featured ?? false,
      features: input.features ?? [],
      image_url: input.image_url ?? null,
      category: input.category ?? null,
      is_active: input.is_active ?? true,
      sort_order: input.sort_order ?? 0,
    };

    const { error } = input.id
      ? await supabase.from("services").update(payload).eq("id", input.id)
      : await supabase.from("services").insert(payload);

    if (error) return { success: false, message: error.message };
    revalidateContent();
    return { success: true, message: "Service saved." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to save service.",
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

export async function upsertPackage(input: {
  id?: string;
  name: string;
  price: number;
  description?: string;
  is_popular?: boolean;
  features?: string[];
  includes?: boolean[];
  sort_order?: number;
  is_active?: boolean;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const payload = {
      name: input.name,
      price: input.price,
      description: input.description ?? null,
      is_popular: input.is_popular ?? false,
      features: input.features ?? [],
      includes: input.includes ?? [],
      sort_order: input.sort_order ?? 0,
      is_active: input.is_active ?? true,
    };

    const { error } = input.id
      ? await supabase.from("packages").update(payload).eq("id", input.id)
      : await supabase.from("packages").insert(payload);

    if (error) return { success: false, message: error.message };
    revalidateContent();
    return { success: true, message: "Package saved." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to save package.",
    };
  }
}

export async function upsertComparisonFeature(input: {
  id?: string;
  label: string;
  sort_order?: number;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const payload = {
      label: input.label,
      sort_order: input.sort_order ?? 0,
    };

    const { error } = input.id
      ? await supabase
          .from("comparison_features")
          .update(payload)
          .eq("id", input.id)
      : await supabase.from("comparison_features").insert(payload);

    if (error) return { success: false, message: error.message };
    revalidateContent();
    return { success: true, message: "Comparison feature saved." };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Failed to save comparison feature.",
    };
  }
}

export async function deleteComparisonFeature(
  id: string,
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("comparison_features")
      .delete()
      .eq("id", id);
    if (error) return { success: false, message: error.message };
    revalidateContent();
    return { success: true, message: "Comparison feature deleted." };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Failed to delete comparison feature.",
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

export async function getAdminPackages() {
  const { supabase } = await requireAdmin();
  const [{ data: packages }, { data: features }] = await Promise.all([
    supabase.from("packages").select("*").order("sort_order"),
    supabase.from("comparison_features").select("*").order("sort_order"),
  ]);
  return { packages: packages ?? [], features: features ?? [] };
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

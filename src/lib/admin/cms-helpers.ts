import { revalidateAllContent } from "@/lib/content/revalidate-cms";
import { loadGalleryPhotoBuffer } from "@/lib/cms/load-gallery-photo-buffer";
import { requireAdmin } from "@/lib/supabase/admin";
import type { Database, Tables } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActionResult } from "@/types/action-result";

export type AdminSupabase = SupabaseClient<Database>;

type SortOrderTable =
  | "services"
  | "pricing_sections"
  | "pricing_items";

export function revalidateCmsContent() {
  revalidateAllContent();
}

export async function withAdminAction(
  fallbackMessage: string,
  fn: (supabase: AdminSupabase) => Promise<ActionResult>,
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    return await fn(supabase);
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : fallbackMessage,
    };
  }
}

export async function loadLinkedGalleryPhotoBuffer(
  supabase: AdminSupabase,
  galleryPhotoId: string,
): Promise<{ buffer: Buffer } | { error: string }> {
  const { data: photo, error: fetchError } = await supabase
    .from("gallery_photos")
    .select("*")
    .eq("id", galleryPhotoId)
    .single();

  if (fetchError || !photo) {
    return { error: "Linked photo not found." };
  }

  try {
    const buffer = await loadGalleryPhotoBuffer(photo);
    return { buffer };
  } catch {
    return { error: "Failed to load linked photo." };
  }
}

export async function nextSortOrder(
  supabase: AdminSupabase,
  table: SortOrderTable,
  filter?: { column: string; value: string },
): Promise<number> {
  let query = supabase
    .from(table)
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);

  if (filter) {
    query = query.eq(filter.column, filter.value);
  }

  const { data: lastRow } = await query.maybeSingle();
  return (lastRow?.sort_order ?? -1) + 1;
}

export async function reorderBySortOrder(
  supabase: AdminSupabase,
  table: SortOrderTable,
  orderedIds: string[],
): Promise<{ error: string } | null> {
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from(table).update({ sort_order: index }).eq("id", id),
    ),
  );

  const error = results.find((result) => result.error)?.error;
  if (error) {
    return { error: error.message };
  }

  return null;
}

export type PricingItemRow = Tables<"pricing_items">;

import {
  galleryItems as staticGalleryItems,
  type GalleryItem,
  type GalleryCategory,
} from "@/content/gallery";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

function mapCategory(value: string | null): GalleryCategory {
  const allowed: GalleryCategory[] = [
    "exterior",
    "interior",
    "correction",
    "coating",
  ];
  if (value && allowed.includes(value as GalleryCategory)) {
    return value as GalleryCategory;
  }
  return "exterior";
}

function groupPhotos(rows: Tables<"job_photos">[]): GalleryItem[] {
  const groups = new Map<
    string,
    {
      title: string;
      category: GalleryCategory;
      description: string;
      before?: string;
      after?: string;
      id: string;
    }
  >();

  for (const row of rows) {
    const key = `${row.title ?? "untitled"}::${row.category ?? "exterior"}`;
    const existing = groups.get(key) ?? {
      id: row.id,
      title: row.title ?? "Gallery item",
      category: mapCategory(row.category),
      description: row.description ?? "",
      before: undefined,
      after: undefined,
    };

    if (row.photo_type === "before") {
      existing.before = row.photo_url;
    } else if (row.photo_type === "after") {
      existing.after = row.photo_url;
    }

    groups.set(key, existing);
  }

  return Array.from(groups.values())
    .filter((group) => group.before && group.after)
    .map((group) => ({
      id: group.id,
      title: group.title,
      category: group.category,
      beforeImage: group.before!,
      afterImage: group.after!,
      description: group.description,
    }));
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_photos")
    .select("*")
    .eq("publish_to_gallery", true)
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return staticGalleryItems;
  }

  const grouped = groupPhotos(data);
  return grouped.length > 0 ? grouped : staticGalleryItems;
}

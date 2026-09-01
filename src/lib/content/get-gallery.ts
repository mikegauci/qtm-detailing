import type {
  CarGalleryGroup,
  GalleryItem,
  GalleryPhoto,
  GalleryPhotoCategory,
} from "@/types/content";
import { parseCarName } from "@/lib/content/parse-car-name";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

function mapCategory(value: string | null): GalleryPhotoCategory {
  const allowed: GalleryPhotoCategory[] = [
    "exterior",
    "interior",
    "correction",
    "coating",
    "car",
  ];
  if (value && allowed.includes(value as GalleryPhotoCategory)) {
    return value as GalleryPhotoCategory;
  }
  return "exterior";
}

function mapRowToPhoto(row: Tables<"job_photos">): GalleryPhoto | null {
  if (!row.photo_url) {
    return null;
  }

  const photoType = row.photo_type === "after" ? "after" : "before";
  const folderName = row.drive_folder_name ?? "";

  return {
    id: row.id,
    imageUrl: row.photo_url,
    photoType,
    category: mapCategory(row.category),
    carName: folderName ? parseCarName(folderName) : undefined,
  };
}

async function fetchPublishedPhotos(): Promise<Tables<"job_photos">[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_photos")
    .select("*")
    .eq("publish_to_gallery", true)
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return [];
  }

  return data;
}

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  const rows = await fetchPublishedPhotos();
  return rows
    .map(mapRowToPhoto)
    .filter((photo): photo is GalleryPhoto => photo !== null);
}

export async function getCarGalleryGroups(): Promise<CarGalleryGroup[]> {
  const photos = (await getGalleryPhotos()).filter((photo) => photo.carName);

  const groups = new Map<
    string,
    { carName: string; beforePhotos: GalleryPhoto[]; afterPhotos: GalleryPhoto[] }
  >();

  for (const photo of photos) {
    const carName = photo.carName ?? "Unknown car";
    const existing = groups.get(carName) ?? {
      carName,
      beforePhotos: [],
      afterPhotos: [],
    };

    if (photo.photoType === "before") {
      existing.beforePhotos.push(photo);
    } else {
      existing.afterPhotos.push(photo);
    }

    groups.set(carName, existing);
  }

  return Array.from(groups.values()).sort((a, b) =>
    a.carName.localeCompare(b.carName),
  );
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const groups = await getCarGalleryGroups();

  return groups
    .filter(
      (group) => group.beforePhotos.length > 0 && group.afterPhotos.length > 0,
    )
    .map((group) => ({
      id: group.beforePhotos[0]?.id ?? group.afterPhotos[0].id,
      title: group.carName,
      category: "car" as const,
      beforeImage: group.beforePhotos[0].imageUrl,
      afterImage: group.afterPhotos[0].imageUrl,
      description: "",
    }));
}

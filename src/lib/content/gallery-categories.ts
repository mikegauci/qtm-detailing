import type { GalleryCategory, GalleryPhotoCategory } from "@/types/content";

export const galleryPhotoCategoryOptions: {
  id: GalleryPhotoCategory;
  label: string;
}[] = [
  { id: "exterior", label: "Exterior" },
  { id: "interior", label: "Interior" },
  { id: "correction", label: "Paint Correction" },
  { id: "coating", label: "Ceramic Coating" },
];

export const galleryPhotoCategoryIds = galleryPhotoCategoryOptions.map(
  (option) => option.id,
);

export function isGalleryPhotoCategory(
  value: string | null | undefined,
): value is GalleryPhotoCategory {
  return (
    value != null &&
    galleryPhotoCategoryIds.includes(value as GalleryPhotoCategory)
  );
}

export function normalizeGalleryPhotoCategory(
  value: string | null | undefined,
): GalleryPhotoCategory {
  return isGalleryPhotoCategory(value) ? value : "exterior";
}

export const galleryCategories: { id: GalleryCategory; label: string }[] = [
  { id: "all", label: "All Work" },
  ...galleryPhotoCategoryOptions,
];

export const GALLERY_PHOTO_FALLBACK_LABEL = "Gallery photo";

export function getGalleryPhotoLabel(photo: { carName?: string }): string {
  return photo.carName ?? GALLERY_PHOTO_FALLBACK_LABEL;
}

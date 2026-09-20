import type {
  GalleryCategory,
  GalleryPhoto,
  GalleryPhotoCategory,
} from "@/types/content";
import { isGalleryPhotoCategory } from "@/lib/content/gallery-categories";
import {
  filterPhotosByType,
  sortPhotosForDisplay,
  type GalleryPhotoTypeFilter,
} from "@/lib/content/gallery-photo-utils";

export type GalleryFilterParams = {
  category?: string;
  car?: string;
  type?: string;
  page?: string;
};

export function parseGalleryFilters(
  params: GalleryFilterParams,
): {
  category: GalleryCategory;
  selectedCar: string;
  photoTypeFilter: GalleryPhotoTypeFilter;
  currentPage: number;
} {
  const category: GalleryCategory =
    params.category &&
    params.category !== "all" &&
    isGalleryPhotoCategory(params.category)
      ? params.category
      : "all";
  const selectedCar = params.car && params.car !== "all" ? params.car : "all";
  const photoTypeFilter =
    params.type === "before" || params.type === "after" ? params.type : "all";
  const currentPage = Math.max(1, Number(params.page) || 1);

  return { category, selectedCar, photoTypeFilter, currentPage };
}

function byCategory(photos: GalleryPhoto[], category: GalleryCategory) {
  return category === "all"
    ? photos
    : photos.filter((photo) => photo.category === category);
}

function byCar(photos: GalleryPhoto[], car: string) {
  return car === "all"
    ? photos
    : photos.filter((photo) => photo.carName === car);
}

export function filterGalleryPhotos(
  photos: GalleryPhoto[],
  filters: ReturnType<typeof parseGalleryFilters>,
): GalleryPhoto[] {
  return sortPhotosForDisplay(
    filterPhotosByType(
      byCar(byCategory(photos, filters.category), filters.selectedCar),
      filters.photoTypeFilter,
    ),
  );
}

export function getGalleryCarNames(
  photos: GalleryPhoto[],
  category: GalleryCategory,
): string[] {
  return Array.from(
    new Set(byCategory(photos, category).map((photo) => photo.carName).filter(Boolean)),
  ).sort() as string[];
}

export function getAvailableGalleryCategories(
  photos: GalleryPhoto[],
  selectedCar: string,
): GalleryPhotoCategory[] {
  return Array.from(new Set(byCar(photos, selectedCar).map((photo) => photo.category)));
}

export function getComparisonPhotos(
  photos: GalleryPhoto[],
  category: GalleryCategory,
  selectedCar: string,
): GalleryPhoto[] {
  return byCar(byCategory(photos, category), selectedCar);
}

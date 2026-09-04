import type { GalleryCategory, GalleryPhoto } from "@/types/content";
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

export function filterGalleryPhotos(
  photos: GalleryPhoto[],
  filters: ReturnType<typeof parseGalleryFilters>,
): GalleryPhoto[] {
  const categoryPhotos =
    filters.category === "all"
      ? photos
      : photos.filter((photo) => photo.category === filters.category);

  const byCar =
    filters.selectedCar === "all"
      ? categoryPhotos
      : categoryPhotos.filter((photo) => photo.carName === filters.selectedCar);

  return sortPhotosForDisplay(
    filterPhotosByType(byCar, filters.photoTypeFilter),
  );
}

export function getGalleryCarNames(
  photos: GalleryPhoto[],
  category: GalleryCategory,
): string[] {
  const categoryPhotos =
    category === "all"
      ? photos
      : photos.filter((photo) => photo.category === category);

  return Array.from(
    new Set(categoryPhotos.map((photo) => photo.carName).filter(Boolean)),
  ).sort() as string[];
}

export function getComparisonPhotos(
  photos: GalleryPhoto[],
  category: GalleryCategory,
  selectedCar: string,
): GalleryPhoto[] {
  const categoryPhotos =
    category === "all"
      ? photos
      : photos.filter((photo) => photo.category === category);

  return selectedCar === "all"
    ? categoryPhotos
    : categoryPhotos.filter((photo) => photo.carName === selectedCar);
}

"use server";

import type { GalleryPhoto } from "@/types/content";
import {
  filterGalleryPhotos,
  getComparisonPhotos,
  type GalleryFilterParams,
  parseGalleryFilters,
} from "@/lib/content/gallery-filters";
import { getGalleryPhotos } from "@/lib/content/get-gallery";

export type GalleryLightboxData = {
  filteredPhotos: GalleryPhoto[];
  comparisonPhotos: GalleryPhoto[];
};

export async function getGalleryLightboxData(
  params: GalleryFilterParams,
): Promise<GalleryLightboxData> {
  const filters = parseGalleryFilters(params);
  const allPhotos = await getGalleryPhotos();

  return {
    filteredPhotos: filterGalleryPhotos(allPhotos, filters),
    comparisonPhotos: getComparisonPhotos(
      allPhotos,
      filters.category,
      filters.selectedCar,
    ),
  };
}

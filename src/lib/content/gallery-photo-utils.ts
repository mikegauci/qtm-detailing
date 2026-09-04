import type { GalleryPhoto } from "@/types/content";

export const GALLERY_PAGE_SIZE = 9;

export type GalleryPhotoTypeFilter = "all" | "before" | "after";

function projectKey(photo: GalleryPhoto): string {
  const identity = photo.carName ?? photo.id;
  return `${identity}|${photo.category}`;
}

function comparePhotos(a: GalleryPhoto, b: GalleryPhoto): number {
  if (a.sortOrder !== b.sortOrder) {
    return a.sortOrder - b.sortOrder;
  }

  return a.id.localeCompare(b.id);
}

export function getProjectPhotos(
  photo: GalleryPhoto,
  photos: GalleryPhoto[],
): GalleryPhoto[] {
  const key = projectKey(photo);
  return photos
    .filter((item) => projectKey(item) === key)
    .sort(comparePhotos);
}

export function getProjectPhotoSets(
  photo: GalleryPhoto,
  photos: GalleryPhoto[],
): {
  beforePhotos: GalleryPhoto[];
  afterPhotos: GalleryPhoto[];
} {
  const projectPhotos = getProjectPhotos(photo, photos);

  return {
    beforePhotos: projectPhotos.filter((item) => item.photoType === "before"),
    afterPhotos: projectPhotos.filter((item) => item.photoType === "after"),
  };
}

export function filterPhotosByType(
  photos: GalleryPhoto[],
  photoType: GalleryPhotoTypeFilter,
): GalleryPhoto[] {
  if (photoType === "all") {
    return photos;
  }

  return photos.filter((photo) => photo.photoType === photoType);
}

export function sortPhotosForDisplay(photos: GalleryPhoto[]): GalleryPhoto[] {
  return [...photos].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return b.sortOrder - a.sortOrder;
    }

    return a.id.localeCompare(b.id);
  });
}

export function getGalleryPageCount(
  totalItems: number,
  pageSize = GALLERY_PAGE_SIZE,
): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function paginatePhotos(
  photos: GalleryPhoto[],
  page: number,
  pageSize = GALLERY_PAGE_SIZE,
): GalleryPhoto[] {
  const start = (page - 1) * pageSize;
  return photos.slice(start, start + pageSize);
}

export function getVisiblePageNumbers(
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages]);

  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page >= 1 && page <= totalPages) {
      pages.add(page);
    }
  }

  const sortedPages = [...pages].sort((a, b) => a - b);
  const visiblePages: (number | "ellipsis")[] = [];
  let previousPage = 0;

  for (const page of sortedPages) {
    if (previousPage && page - previousPage > 1) {
      visiblePages.push("ellipsis");
    }

    visiblePages.push(page);
    previousPage = page;
  }

  return visiblePages;
}

export function clampLightboxIndex(index: number, length: number): number {
  if (length <= 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), length - 1);
}

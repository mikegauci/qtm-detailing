import type { GalleryPhoto } from "@/types/content";

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
    if (a.carName !== b.carName) {
      return (a.carName ?? "").localeCompare(b.carName ?? "");
    }

    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }

    if (a.photoType !== b.photoType) {
      return a.photoType === "before" ? -1 : 1;
    }

    return comparePhotos(a, b);
  });
}

export function clampLightboxIndex(index: number, length: number): number {
  if (length <= 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), length - 1);
}

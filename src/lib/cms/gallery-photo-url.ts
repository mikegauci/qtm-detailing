/** Append a cache-buster so re-uploads to the same storage path refresh in browsers/CDN. */
export function galleryPhotoDisplayUrl(
  photoUrl: string,
  version?: string | null,
): string {
  const base = photoUrl.split("?")[0];
  const existingVersion = photoUrl.match(/[?&]v=(\d+)/)?.[1];
  if (existingVersion) {
    return `${base}?v=${existingVersion}`;
  }
  if (version) {
    return `${base}?v=${new Date(version).getTime()}`;
  }
  return photoUrl;
}

export function withCacheBuster(publicUrl: string): string {
  const base = publicUrl.split("?")[0];
  return `${base}?v=${Date.now()}`;
}

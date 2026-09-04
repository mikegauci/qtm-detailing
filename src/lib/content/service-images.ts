import type { ServiceImage } from "@/types/content";

const DEFAULT_FOCAL_Y = 50;

export function parseServiceImages(
  images: unknown,
  fallbackUrl?: string | null,
): ServiceImage[] {
  if (Array.isArray(images)) {
    const parsed = images
      .map((item) => {
        if (
          item &&
          typeof item === "object" &&
          "url" in item &&
          typeof item.url === "string" &&
          item.url
        ) {
          const focalY =
            "focalY" in item && typeof item.focalY === "number"
              ? Math.min(100, Math.max(0, item.focalY))
              : DEFAULT_FOCAL_Y;

          return { url: item.url, focalY };
        }

        return null;
      })
      .filter((item): item is ServiceImage => item !== null);

    if (parsed.length > 0) {
      return parsed;
    }
  }

  if (fallbackUrl) {
    return [{ url: fallbackUrl, focalY: DEFAULT_FOCAL_Y }];
  }

  return [];
}

export function serviceImageObjectPosition(focalY: number): string {
  return `center ${focalY}%`;
}

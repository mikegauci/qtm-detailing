import type { CSSProperties } from "react";
import type { ServiceImage } from "@/types/content";

const DEFAULT_FOCAL_Y = 50;
const DEFAULT_ZOOM = 100;
const MIN_ZOOM = 100;
const MAX_ZOOM = 250;

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
          const zoom =
            "zoom" in item && typeof item.zoom === "number"
              ? Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, item.zoom))
              : DEFAULT_ZOOM;

          return { url: item.url, focalY, zoom };
        }

        return null;
      })
      .filter((item): item is ServiceImage => item !== null);

    if (parsed.length > 0) {
      return parsed;
    }
  }

  if (fallbackUrl) {
    return [{ url: fallbackUrl, focalY: DEFAULT_FOCAL_Y, zoom: DEFAULT_ZOOM }];
  }

  return [];
}

export function serviceImageObjectPosition(focalY: number): string {
  return `center ${focalY}%`;
}

export function serviceImageZoomStyle(
  image: Pick<ServiceImage, "focalY" | "zoom">,
): CSSProperties {
  const zoom = image.zoom ?? DEFAULT_ZOOM;

  if (zoom === DEFAULT_ZOOM) {
    return {};
  }

  return {
    transform: `scale(${zoom / 100})`,
    transformOrigin: serviceImageObjectPosition(image.focalY),
  };
}

export function serviceImageStyle(
  image: Pick<ServiceImage, "focalY" | "zoom">,
): CSSProperties {
  return {
    objectPosition: serviceImageObjectPosition(image.focalY),
    ...serviceImageZoomStyle(image),
  };
}

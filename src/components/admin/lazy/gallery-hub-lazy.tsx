"use client";

import { createLazyComponent } from "@/lib/lazy/create-lazy-component";
import type { GalleryHub } from "@/components/admin/gallery-hub";

export const GalleryHubLazy = createLazyComponent<
  React.ComponentProps<typeof GalleryHub>
>(
  () => import("@/components/admin/gallery-hub"),
  "GalleryHub",
  "gallery",
);

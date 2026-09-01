import type { GalleryCategory } from "@/types/content";

export const galleryCategories: { id: GalleryCategory; label: string }[] = [
  { id: "all", label: "All Work" },
  { id: "exterior", label: "Exterior" },
  { id: "interior", label: "Interior" },
  { id: "correction", label: "Paint Correction" },
  { id: "coating", label: "Ceramic Coating" },
];

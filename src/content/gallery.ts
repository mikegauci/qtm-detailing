export type GalleryItem = {
  id: string;
  title: string;
  category: GalleryCategory;
  beforeImage: string;
  afterImage: string;
  description: string;
};

export type GalleryCategory =
  | "all"
  | "exterior"
  | "interior"
  | "correction"
  | "coating";

export const galleryCategories: { id: GalleryCategory; label: string }[] = [
  { id: "all", label: "All Work" },
  { id: "exterior", label: "Exterior" },
  { id: "interior", label: "Interior" },
  { id: "correction", label: "Paint Correction" },
  { id: "coating", label: "Ceramic Coating" },
];

export const galleryItems: GalleryItem[] = [
  {
    id: "1",
    title: "Paint Enhancement",
    category: "correction",
    beforeImage: "/exterior-detail-v2.jpg",
    afterImage: "/complete-paint-enhancement.jpg",
    description: "Two-stage correction removing years of wash marks.",
  },
  {
    id: "2",
    title: "Ceramic Paint Protection",
    category: "coating",
    beforeImage: "/premium-wax-protection.jpg",
    afterImage: "/ceramic-paint-protection.jpg",
    description: "1-year ceramic coating with hydrophobic top coat.",
  },
  {
    id: "3",
    title: "Premium Interior Deep Clean",
    category: "interior",
    beforeImage: "/complete-detail.jpg",
    afterImage: "/premium-interior-deep-clean.jpg",
    description: "Full leather conditioning and steam extraction.",
  },
  {
    id: "4",
    title: "Exterior Detail",
    category: "exterior",
    beforeImage: "/exterior-detail-v2.jpg",
    afterImage: "/signature-detail.jpg",
    description: "Decontamination wash and machine polish finish.",
  },
  {
    id: "5",
    title: "Paint Enhancement Package",
    category: "correction",
    beforeImage: "/paint-enhancement.jpg",
    afterImage: "/complete-paint-enhancement.jpg",
    description: "Single-stage enhancement for a deep gloss finish.",
  },
  {
    id: "6",
    title: "Signature Detail + Glass Protection",
    category: "coating",
    beforeImage: "/signature-detail.jpg",
    afterImage: "/signature-detail-glass-protection.jpg",
    description: "Correction, coating, and interior detail combo.",
  },
];

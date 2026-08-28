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
    title: "BMW M3 — Full Correction",
    category: "correction",
    beforeImage:
      "https://images.unsplash.com/photo-1555215695-3004980adade?w=800&q=80",
    afterImage:
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80",
    description: "Two-stage correction removing years of wash marks.",
  },
  {
    id: "2",
    title: "Mercedes AMG — Ceramic Coating",
    category: "coating",
    beforeImage:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    afterImage:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    description: "5-year ceramic coating with hydrophobic top coat.",
  },
  {
    id: "3",
    title: "Porsche 911 — Interior Restore",
    category: "interior",
    beforeImage:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
    afterImage:
      "https://images.unsplash.com/photo-1583121274602-3e2820cff7b4?w=800&q=80",
    description: "Full leather conditioning and steam extraction.",
  },
  {
    id: "4",
    title: "Audi RS — Exterior Detail",
    category: "exterior",
    beforeImage:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
    afterImage:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
    description: "Decontamination wash and machine polish finish.",
  },
  {
    id: "5",
    title: "Range Rover — Paint Enhancement",
    category: "correction",
    beforeImage:
      "https://images.unsplash.com/photo-1519641471654-76ecee13b8e7?w=800&q=80",
    afterImage:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
    description: "Single-stage enhancement for a deep gloss finish.",
  },
  {
    id: "6",
    title: "Lamborghini Huracán — Full Package",
    category: "coating",
    beforeImage:
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9a?w=800&q=80",
    afterImage:
      "https://images.unsplash.com/photo-1614200187524-dc4a3e76508f?w=800&q=80",
    description: "Correction, coating, and interior detail combo.",
  },
];

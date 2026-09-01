import type { Metadata } from "next";
import { GalleryPageContent } from "@/components/gallery/gallery-page-content";
import { defaultCtaBand, defaultGalleryHero } from "@/lib/content/cms-defaults";
import { getGalleryPhotos } from "@/lib/content/get-gallery";
import { getPageSection } from "@/lib/content/get-page-section";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Browse QTM Detailing's portfolio — before and after transformations, paint correction, ceramic coating, and interior restoration in Malta.",
};

export default async function GalleryPage() {
  const [photos, cta, hero] = await Promise.all([
    getGalleryPhotos(),
    getPageSection("home", "cta-band", defaultCtaBand),
    getPageSection("gallery", "hero", defaultGalleryHero),
  ]);

  return <GalleryPageContent photos={photos} cta={cta} hero={hero} />;
}

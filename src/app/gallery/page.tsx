import { GalleryPageContent } from "@/components/gallery/gallery-page-content";
import { defaultCtaBand, defaultGalleryHero } from "@/lib/content/cms-defaults";
import { getGalleryPhotos } from "@/lib/content/get-gallery";
import { getPageSection } from "@/lib/content/get-page-section";

export default async function GalleryPage() {
  const [photos, cta, hero] = await Promise.all([
    getGalleryPhotos(),
    getPageSection("home", "cta-band", defaultCtaBand),
    getPageSection("gallery", "hero", defaultGalleryHero),
  ]);

  return <GalleryPageContent photos={photos} cta={cta} hero={hero} />;
}

import { GalleryPageContent } from "@/components/gallery/gallery-page-content";
import { defaultCtaBand, defaultGalleryHero } from "@/lib/content/cms-defaults";
import { getGalleryItems } from "@/lib/content/get-gallery";
import { getPageSection } from "@/lib/content/get-page-section";

export default async function GalleryPage() {
  const [items, cta, hero] = await Promise.all([
    getGalleryItems(),
    getPageSection("home", "cta-band", defaultCtaBand),
    getPageSection("gallery", "hero", defaultGalleryHero),
  ]);

  return <GalleryPageContent items={items} cta={cta} hero={hero} />;
}

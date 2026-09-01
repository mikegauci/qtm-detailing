import { GalleryPageContent } from "@/components/gallery/gallery-page-content";
import { getGalleryItems } from "@/lib/content/get-gallery";
import { getPageSection } from "@/lib/content/get-page-section";
import type { CtaBandContent } from "@/components/admin/page-copy-editor";

const defaultCta: CtaBandContent = {
  title: "Ready for showroom results?",
  description:
    "Request a free quote and we'll get back within 24 hours with availability and personalised pricing for your vehicle.",
  primaryCta: { label: "Request a Quote", href: "/contact" },
  secondaryCta: { label: "Explore Services", href: "/services" },
};

export default async function GalleryPage() {
  const [items, cta] = await Promise.all([
    getGalleryItems(),
    getPageSection("home", "cta-band", defaultCta),
  ]);

  return <GalleryPageContent items={items} cta={cta} />;
}

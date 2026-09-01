import { HeroSection } from "@/components/sections/hero-section";
import { FeaturedServicesSection } from "@/components/sections/featured-services";
import { WhyQtmSection } from "@/components/sections/why-qtm";
import { BeforeAfterShowcase } from "@/components/sections/before-after-showcase";
import { PricingPreviewSection } from "@/components/sections/pricing-preview";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { CtaBand } from "@/components/sections/cta-band";
import { getServices } from "@/lib/content/get-services";
import { getPackages } from "@/lib/content/get-packages";
import { getTestimonials } from "@/lib/content/get-testimonials";
import { getGalleryItems } from "@/lib/content/get-gallery";
import { getPageSection } from "@/lib/content/get-page-section";
import type {
  CtaBandContent,
  HeroContent,
  WhyQtmContent,
} from "@/components/admin/page-copy-editor";

const defaultHero: HeroContent = {
  eyebrow: "Malta's Premium Detailing Studio",
  titleLine1: "Showroom-grade",
  titleLine2: "detailing for every drive",
  description:
    "Paint correction, ceramic coating, and interior restoration, crafted with precision for Malta's most discerning drivers.",
  primaryCta: { label: "Request a Quote", href: "/contact" },
  secondaryCta: { label: "View Services", href: "/services" },
  mobileImage: "/about-page-mobile.jpg",
  desktopImage: "/about-page.jpg",
};

const defaultWhyQtm: WhyQtmContent = {
  eyebrow: "Why QTM Detailing",
  title: "Obsessive detail. Lasting results.",
  description:
    "We don't rush. Every vehicle gets a personalised treatment plan based on its condition, paint type, and your expectations.",
  reasons: [
    {
      title: "Studio-grade equipment",
      description:
        "Dual-action and rotary polishers, steam extractors, and IR curing — the same tools used in professional body shops.",
    },
    {
      title: "OEM-safe products",
      description:
        "We use Gyeon, Koch Chemie, and CarPro — premium brands trusted by manufacturers worldwide.",
    },
    {
      title: "Transparent process",
      description:
        "Before-and-after documentation, paint depth readings, and clear pricing with no hidden fees.",
    },
    {
      title: "Malta climate expertise",
      description:
        "Coatings and sealants selected specifically for intense UV exposure and coastal salt air.",
    },
  ],
};

const defaultCta: CtaBandContent = {
  title: "Ready for showroom results?",
  description:
    "Request a free quote and we'll get back within 24 hours with availability and personalised pricing for your vehicle.",
  primaryCta: { label: "Request a Quote", href: "/contact" },
  secondaryCta: { label: "Explore Services", href: "/services" },
};

export default async function HomePage() {
  const [services, { packages }, testimonials, galleryItems, hero, whyQtm, cta] =
    await Promise.all([
      getServices(),
      getPackages(),
      getTestimonials(),
      getGalleryItems(),
      getPageSection("home", "hero", defaultHero),
      getPageSection("home", "why-qtm", defaultWhyQtm),
      getPageSection("home", "cta-band", defaultCta),
    ]);

  return (
    <>
      <HeroSection content={hero} />
      <FeaturedServicesSection services={services} />
      <WhyQtmSection content={whyQtm} />
      <BeforeAfterShowcase items={galleryItems} />
      <PricingPreviewSection packages={packages} />
      {testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials} />
      )}
      <CtaBand content={cta} />
    </>
  );
}

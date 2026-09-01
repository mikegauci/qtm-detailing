import { HeroSection } from "@/components/sections/hero-section";
import { FeaturedServicesSection } from "@/components/sections/featured-services";
import { WhyQtmSection } from "@/components/sections/why-qtm";
import { BeforeAfterShowcase } from "@/components/sections/before-after-showcase";
import { PricingPreviewSection } from "@/components/sections/pricing-preview";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { CtaBand } from "@/components/sections/cta-band";
import {
  defaultCtaBand,
  defaultFeaturedServicesHeading,
  defaultHero,
  defaultWhyQtm,
} from "@/lib/content/cms-defaults";
import { getGalleryItems } from "@/lib/content/get-gallery";
import { getPackages } from "@/lib/content/get-packages";
import { getPageSection } from "@/lib/content/get-page-section";
import { getServices } from "@/lib/content/get-services";
import { getTestimonials } from "@/lib/content/get-testimonials";

export default async function HomePage() {
  const [
    services,
    { packages },
    testimonials,
    galleryItems,
    hero,
    whyQtm,
    cta,
    featuredServicesHeading,
  ] = await Promise.all([
    getServices(),
    getPackages(),
    getTestimonials(),
    getGalleryItems(),
    getPageSection("home", "hero", defaultHero),
    getPageSection("home", "why-qtm", defaultWhyQtm),
    getPageSection("home", "cta-band", defaultCtaBand),
    getPageSection("home", "featured-services", defaultFeaturedServicesHeading),
  ]);

  return (
    <>
      <HeroSection content={hero} />
      <FeaturedServicesSection
        services={services}
        heading={featuredServicesHeading}
      />
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

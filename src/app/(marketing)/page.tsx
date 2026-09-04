import { HeroSection } from "@/components/sections/hero-section";
import { FeaturedServicesSection } from "@/components/sections/featured-services";
import { WhyQtmSection } from "@/components/sections/why-qtm";
import { PricingPreviewSection } from "@/components/sections/pricing-preview";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { CtaBand } from "@/components/sections/cta-band";
import {
  defaultCtaBand,
  defaultFeaturedServicesHeading,
  defaultHero,
  defaultWhyQtm,
} from "@/lib/content/cms-defaults";
import { getPackages } from "@/lib/content/get-packages";
import { getPageSections } from "@/lib/content/get-page-section";
import { getServices } from "@/lib/content/get-services";
import { getTestimonials } from "@/lib/content/get-testimonials";

export const revalidate = 3600;

export default async function HomePage() {
  const [services, { packages }, testimonials, sections] = await Promise.all([
    getServices(),
    getPackages(),
    getTestimonials(),
    getPageSections("home", {
      hero: defaultHero,
      "why-qtm": defaultWhyQtm,
      "cta-band": defaultCtaBand,
      "featured-services": defaultFeaturedServicesHeading,
    }),
  ]);

  return (
    <>
      <HeroSection content={sections.hero} />
      <FeaturedServicesSection
        services={services}
        heading={sections["featured-services"]}
      />
      <WhyQtmSection content={sections["why-qtm"]} />
      <PricingPreviewSection packages={packages} />
      {testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials} />
      )}
      <CtaBand content={sections["cta-band"]} />
    </>
  );
}

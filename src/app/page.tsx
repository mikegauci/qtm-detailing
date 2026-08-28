import { HeroSection } from "@/components/sections/hero-section";
import { FeaturedServicesSection } from "@/components/sections/featured-services";
import { WhyQtmSection } from "@/components/sections/why-qtm";
import { BeforeAfterShowcase } from "@/components/sections/before-after-showcase";
import { PricingPreviewSection } from "@/components/sections/pricing-preview";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { CtaBand } from "@/components/sections/cta-band";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedServicesSection />
      <WhyQtmSection />
      <BeforeAfterShowcase />
      <PricingPreviewSection />
      <TestimonialsSection />
      <CtaBand />
    </>
  );
}

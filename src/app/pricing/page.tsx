import type { Metadata } from "next";
import { SectionHeading, CTAButton } from "@/components/ui/section-heading";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/fade-in";
import { CtaBand } from "@/components/sections/cta-band";
import { PricingCard } from "@/components/pricing/pricing-card";
import { defaultCtaBand } from "@/lib/content/cms-defaults";
import { getPageSection } from "@/lib/content/get-page-section";
import {
  addonPricingItems,
  ceramicCoatingIntro,
  ceramicPricingItems,
  corePricingItems,
  pricingHero,
  pricingImportantInfo,
} from "@/lib/content/pricing-data";

export const metadata: Metadata = {
  title: "Pricing",
  description: "QTM Detailing service pricing — starting rates by vehicle size.",
  robots: { index: false, follow: false },
};

export default async function PricingPage() {
  const cta = await getPageSection("home", "cta-band", defaultCtaBand);

  return (
    <>
      <section className="section-padding pt-32">
        <div className="container-narrow">
          <FadeIn>
            <SectionHeading
              eyebrow={pricingHero.eyebrow}
              title={pricingHero.title}
              description={pricingHero.description}
            />
          </FadeIn>

          <StaggerContainer className="grid gap-8">
            {corePricingItems.map((item) => (
              <StaggerItem key={item.slug}>
                <PricingCard item={item} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="section-padding bg-surface-raised/30">
        <div className="container-narrow">
          <FadeIn>
            <div className="mb-8">
              <h2 className="text-xl font-bold">{ceramicCoatingIntro.heading}</h2>
              <p className="mt-2 text-muted-foreground">
                {ceramicCoatingIntro.intro}
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid gap-8">
            {ceramicPricingItems.map((item) => (
              <StaggerItem key={item.slug}>
                <PricingCard item={item} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <StaggerContainer className="grid gap-8">
            {addonPricingItems.map((item) => (
              <StaggerItem key={item.slug}>
                <PricingCard item={item} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="section-padding bg-surface-raised/30">
        <div className="container-narrow max-w-3xl">
          <FadeIn>
            <SectionHeading
              eyebrow="Pricing"
              title={pricingImportantInfo.title}
            />
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="space-y-4 text-muted-foreground">
              {pricingImportantInfo.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <ul className="list-inside list-disc space-y-1 pl-2">
                {pricingImportantInfo.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              {pricingImportantInfo.closingParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <CTAButton href="/contact" className="mt-4">
                Request a Quote
              </CTAButton>
            </div>
          </FadeIn>
        </div>
      </section>

      <CtaBand content={cta} />
    </>
  );
}

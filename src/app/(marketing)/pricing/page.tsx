import type { Metadata } from "next";
import { SectionHeading, CTAButton } from "@/components/ui/section-heading";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/fade-in";
import { CtaBand } from "@/components/sections/cta-band";
import { PricingCard } from "@/components/pricing/pricing-card";
import { defaultCtaBand } from "@/lib/content/cms-defaults";
import { getPageSections } from "@/lib/content/get-page-section";
import {
  pricingHero,
  pricingImportantInfo,
  pricingSections,
} from "@/lib/content/pricing-data";

export const metadata: Metadata = {
  title: "Pricing",
  description: "QTM Detailing service pricing — starting rates by vehicle size.",
  robots: { index: false, follow: false },
};

export const revalidate = 3600;

export default async function PricingPage() {
  const sections = await getPageSections("home", {
    "cta-band": defaultCtaBand,
  });

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

          <div className="grid gap-16">
            {pricingSections.map((section, sectionIndex) => (
              <div key={section.id}>
                {(section.heading || section.intro) && (
                  <FadeIn>
                    <div className={sectionIndex > 0 ? "mb-8" : "mb-8 mt-4"}>
                      {section.heading && (
                        <h2 className="text-xl font-bold">{section.heading}</h2>
                      )}
                      {section.intro && (
                        <p className="mt-2 text-muted-foreground">
                          {section.intro}
                        </p>
                      )}
                    </div>
                  </FadeIn>
                )}

                <StaggerContainer className="grid gap-8">
                  {section.items.map((item) => (
                    <StaggerItem key={item.slug}>
                      <PricingCard item={item} />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            ))}
          </div>
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

      <CtaBand content={sections["cta-band"]} />
    </>
  );
}

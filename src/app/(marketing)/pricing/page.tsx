import type { Metadata } from "next";
import { InternalPageSection } from "@/components/layout/internal-page-section";
import { PageSection } from "@/components/layout/page-section";
import { SectionHeading, CTAButton } from "@/components/ui/section-heading";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/fade-in";
import { CtaBand } from "@/components/sections/cta-band";
import { PricingCard } from "@/components/pricing/pricing-card";
import { defaultCtaBand } from "@/lib/content/cms-defaults";
import { getPageSections } from "@/lib/content/get-page-section";
import {
  getPricingHero,
  getPricingImportantInfo,
  getPricingSections,
} from "@/lib/content/get-pricing";
import { pricingImportantInfo as defaultImportantInfo } from "@/lib/content/pricing-data";
import { getSiteSettings } from "@/lib/content/get-site-settings";

export const metadata: Metadata = {
  title: "Pricing",
  description: "QTM Detailing service pricing — starting rates by vehicle size.",
  robots: { index: false, follow: false },
};

export const revalidate = 3600;

export default async function PricingPage() {
  const [hero, pricingSections, importantInfo, sections, settings] =
    await Promise.all([
    getPricingHero(),
    getPricingSections(),
    getPricingImportantInfo(),
    getPageSections("home", {
      "cta-band": defaultCtaBand,
    }),
    getSiteSettings(),
  ]);

  const quoteCtaLabel =
    importantInfo.ctaLabel?.trim() ||
    defaultImportantInfo.ctaLabel ||
    "Request a Quote";
  const quoteCtaHref =
    importantInfo.ctaHref?.trim() ||
    defaultImportantInfo.ctaHref ||
    settings.contact.whatsappUrl;

  return (
    <>
      <InternalPageSection>
        <FadeIn>
            <SectionHeading
              eyebrow={hero.eyebrow}
              title={hero.title}
              description={hero.description}
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
      </InternalPageSection>

      <PageSection raised narrow>
          <FadeIn>
            <SectionHeading
              eyebrow={importantInfo.eyebrow ?? "Pricing"}
              title={importantInfo.title}
            />
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="space-y-4 text-muted-foreground">
              {importantInfo.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <ul className="list-inside list-disc space-y-1 pl-2">
                {importantInfo.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              {importantInfo.closingParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <CTAButton href={quoteCtaHref} className="mt-4">
                {quoteCtaLabel}
              </CTAButton>
            </div>
          </FadeIn>
      </PageSection>

      <CtaBand content={sections["cta-band"]} />
    </>
  );
}

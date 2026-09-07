import type { Metadata } from "next";
import Image from "next/image";
import { InternalPageSection } from "@/components/layout/internal-page-section";
import { PageSection } from "@/components/layout/page-section";
import { SectionHeading, CTAButton } from "@/components/ui/section-heading";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/fade-in";
import { CtaBand } from "@/components/sections/cta-band";
import {
  defaultAboutIntro,
  defaultCtaBand,
  defaultProcessSteps,
} from "@/lib/content/cms-defaults";
import { getPageSections } from "@/lib/content/get-page-section";
import { getSiteSettings } from "@/lib/content/get-site-settings";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about QTM Detailing — Malta's premium automotive detailing studio. Our story and process.",
};

export const revalidate = 3600;

export default async function AboutPage() {
  const [aboutSections, homeSections, settings] = await Promise.all([
    getPageSections("about", {
      intro: defaultAboutIntro,
      "process-steps": defaultProcessSteps,
    }),
    getPageSections("home", {
      "cta-band": defaultCtaBand,
    }),
    getSiteSettings(),
  ]);

  const intro = aboutSections.intro;
  const processSteps = aboutSections["process-steps"];
  const cta = homeSections["cta-band"];

  return (
    <>
      <InternalPageSection>
        <div className="grid items-center gap-12 lg:grid-cols-2">
            <FadeIn className="text-center lg:text-left">
              <SectionHeading
                eyebrow={intro.eyebrow}
                title={intro.title}
                description={intro.description}
                align="left"
                className="mb-0"
              />
              <p className="mt-6 text-lg text-muted-foreground">{intro.mission}</p>
              <div className="mx-auto mt-8 flex w-full max-w-sm justify-center lg:mx-0 lg:justify-start">
                <CTAButton href={settings.contact.whatsappUrl} className="w-full lg:w-auto">
                  Message on WhatsApp
                </CTAButton>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="relative aspect-[621/1024] overflow-hidden rounded-2xl lg:aspect-[4/3]">
                <Image
                  src={intro.mobileImage}
                  alt="QTM Detailing studio"
                  fill
                  className="object-cover lg:hidden"
                  sizes="100vw"
                />
                <Image
                  src={intro.desktopImage}
                  alt="QTM Detailing studio"
                  fill
                  className="hidden object-cover lg:block"
                  sizes="50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-base/60 to-transparent" />
              </div>
            </FadeIn>
        </div>
      </InternalPageSection>

      <PageSection raised>
          <FadeIn>
            <SectionHeading
              eyebrow={processSteps.eyebrow}
              title={processSteps.title}
              description={processSteps.description}
            />
          </FadeIn>

          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.steps.map((step) => (
              <StaggerItem key={step.step}>
                <div className="glass-panel h-full rounded-2xl p-6">
                  <span className="text-3xl font-bold text-brand-purple-400/50">
                    {step.step}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
      </PageSection>

      <CtaBand content={cta} />
    </>
  );
}

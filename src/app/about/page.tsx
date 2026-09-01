import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Wrench, Shield, Sparkles } from "lucide-react";
import { SectionHeading, CTAButton } from "@/components/ui/section-heading";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/fade-in";
import { CtaBand } from "@/components/sections/cta-band";
import {
  defaultAboutIntro,
  defaultCtaBand,
  defaultEquipment,
  defaultProcessSteps,
} from "@/lib/content/cms-defaults";
import { getPageSection } from "@/lib/content/get-page-section";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about QTM Detailing — Malta's premium automotive detailing studio. Our story, process, equipment, and service area.",
};

const equipmentIcons = [Wrench, Sparkles, Shield, MapPin];

export default async function AboutPage() {
  const [intro, processSteps, equipment, cta] = await Promise.all([
    getPageSection("about", "intro", defaultAboutIntro),
    getPageSection("about", "process-steps", defaultProcessSteps),
    getPageSection("about", "equipment", defaultEquipment),
    getPageSection("home", "cta-band", defaultCtaBand),
  ]);

  return (
    <>
      <section className="section-padding pt-32">
        <div className="container-narrow">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <FadeIn>
              <SectionHeading
                eyebrow={intro.eyebrow}
                title={intro.title}
                description={intro.description}
                align="left"
                className="mb-0"
              />
              <p className="mt-6 text-lg text-muted-foreground">{intro.mission}</p>
              <CTAButton href="/contact" className="mt-8">
                Contact Us
              </CTAButton>
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
        </div>
      </section>

      <section className="section-padding bg-surface-raised/30">
        <div className="container-narrow">
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
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <FadeIn>
            <SectionHeading
              eyebrow={equipment.eyebrow}
              title={equipment.title}
              description={equipment.description}
            />
          </FadeIn>

          <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {equipment.items.map((title, index) => {
              const Icon = equipmentIcons[index % equipmentIcons.length];
              return (
                <StaggerItem key={title}>
                  <div className="glass-panel flex items-center gap-4 rounded-xl p-5">
                    <Icon className="h-8 w-8 shrink-0 text-brand-cyan-400" />
                    <span className="font-medium">{title}</span>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      <CtaBand content={cta} />
    </>
  );
}

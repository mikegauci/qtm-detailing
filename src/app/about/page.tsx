import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Wrench, Shield, Sparkles } from "lucide-react";
import { SectionHeading, CTAButton } from "@/components/ui/section-heading";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/fade-in";
import { CtaBand } from "@/components/sections/cta-band";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about QTM Detailing — Malta's premium automotive detailing studio. Our story, process, equipment, and service area.",
};

const processSteps = [
  {
    step: "01",
    title: "Consultation",
    description:
      "We inspect your vehicle, discuss your goals, and recommend the right services for your budget and timeline.",
  },
  {
    step: "02",
    title: "Preparation",
    description:
      "Thorough wash, decontamination, and paint depth measurement ensure we start with a clean, assessed surface.",
  },
  {
    step: "03",
    title: "Treatment",
    description:
      "Our technicians apply correction, coating, or interior services using studio-grade equipment and premium products.",
  },
  {
    step: "04",
    title: "Inspection",
    description:
      "Final quality check under dedicated lighting. We walk you through the results and provide aftercare guidance.",
  },
];

const equipment = [
  { icon: Wrench, title: "Rupes & Flex polishers" },
  { icon: Sparkles, title: "Gyeon & Koch Chemie products" },
  { icon: Shield, title: "Paint depth gauges & IR curing" },
  { icon: MapPin, title: "Climate-controlled studio" },
];

export default function AboutPage() {
  return (
    <>
      <section className="section-padding pt-32">
        <div className="container-narrow">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <FadeIn>
              <SectionHeading
                eyebrow="About QTM Detailing"
                title="Passion for perfection"
                description="Founded in Malta with a simple mission: deliver showroom-grade results that last. Every vehicle that enters our studio receives the same obsessive attention, whether it's a daily commuter or a weekend supercar."
                align="left"
                className="mb-0"
              />
              <p className="mt-6 text-lg text-muted-foreground">
                QTM stands for Quad Tang Muto, meaning &ldquo;What I touch, I
                change.&rdquo; Our team combines years of experience in
                automotive care with continuous training on the latest products
                and techniques. We believe detailing is a craft, and your car
                deserves nothing less than mastery.
              </p>
              <CTAButton href="/contact" className="mt-8">
                Work With Us
              </CTAButton>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="relative aspect-[621/1024] overflow-hidden rounded-2xl lg:aspect-[4/3]">
                <Image
                  src="/about-page-mobile.jpg"
                  alt="QTM Detailing studio"
                  fill
                  className="object-cover lg:hidden"
                  sizes="100vw"
                />
                <Image
                  src="/about-page.jpg"
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
              eyebrow="Our Process"
              title="Four steps to showroom"
              description="A transparent, repeatable process that delivers consistent results every time."
            />
          </FadeIn>

          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step) => (
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
              eyebrow="Equipment"
              title="Studio-grade tools"
              description="We invest in professional equipment and premium products so your results speak for themselves."
            />
          </FadeIn>

          <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {equipment.map((item) => (
              <StaggerItem key={item.title}>
                <div className="glass-panel flex items-center gap-4 rounded-xl p-5">
                  <item.icon className="h-8 w-8 shrink-0 text-brand-cyan-400" />
                  <span className="font-medium">{item.title}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <CtaBand />
    </>
  );
}

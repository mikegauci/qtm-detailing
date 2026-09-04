import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CTAButton } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/motion/fade-in";
import type { HeroContent } from "@/types/page-sections";

type HeroSectionProps = {
  content: HeroContent;
};

export function HeroSection({ content }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen overflow-hidden noise-overlay">
      <div className="absolute inset-0 bg-surface-base">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_0%,rgb(2_121_145_/_0.12),transparent)]" />
      </div>

      <div className="pointer-events-none absolute inset-0 lg:hidden">
        <FadeIn delay={0.25} direction="up" className="relative h-full">
          <Image
            src={content.mobileImage}
            alt="Glossy black sports car in the QTM detailing studio"
            fill
            priority
            className="object-cover object-bottom opacity-80"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-surface-base from-0% via-surface-base/90 via-40% to-surface-base/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-surface-base/60 via-35% to-transparent" />
        </FadeIn>
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] lg:block">
        <FadeIn delay={0.25} direction="left" className="relative h-full">
          <Image
            src={content.desktopImage}
            alt="Glossy black sports car in the QTM detailing studio"
            fill
            className="object-cover object-right opacity-80"
            sizes="58vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-base from-0% via-surface-base/90 via-35% to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-surface-base/60 via-35% to-transparent" />
        </FadeIn>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-48 bg-gradient-to-b from-transparent via-surface-base/80 to-surface-base sm:h-56 lg:h-64" />

      <div className="container-narrow relative z-[2] flex min-h-screen flex-col justify-center px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-brand-cyan-400">
            {content.eyebrow}
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:max-w-2xl lg:text-7xl">
            <span className="gradient-text">{content.titleLine1}</span>
            <br />
            <span className="text-foreground">{content.titleLine2}</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl lg:max-w-lg">
            {content.description}
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <CTAButton
              href={content.primaryCta.href}
              className="gap-2 px-8 py-4 text-base"
            >
              {content.primaryCta.label}
              <ArrowRight className="h-4 w-4" />
            </CTAButton>
            <CTAButton
              href={content.secondaryCta.href}
              variant="outline"
              className="px-8 py-4 text-base"
            >
              {content.secondaryCta.label}
            </CTAButton>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

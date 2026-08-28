"use client";

import Image from "next/image";
import { ArrowRight, Shield, Sparkles, Award, Clock } from "lucide-react";
import { CTAButton } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/motion/fade-in";

const trustItems = [
  { icon: Shield, label: "Insured & Certified" },
  { icon: Sparkles, label: "Premium Products" },
  { icon: Award, label: "500+ Cars Detailed" },
  { icon: Clock, label: "Same-Day Options" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden noise-overlay">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1614200187524-dc4a3e76508f?w=1920&q=80"
          alt="Luxury car with premium finish"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-base via-surface-base/90 to-surface-base/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-transparent to-surface-base/60" />
      </div>

      <div className="container-narrow relative flex min-h-screen flex-col justify-center px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-brand-cyan-400">
            Malta&apos;s Premium Detailing Studio
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-7xl">
            <span className="gradient-text">Showroom-grade</span>
            <br />
            <span className="text-foreground">detailing for every drive</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
            Paint correction, ceramic coating, and interior restoration —
            crafted with precision for Malta&apos;s most discerning drivers.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <CTAButton href="/contact" className="gap-2 px-8 py-4 text-base">
              Request a Quote
              <ArrowRight className="h-4 w-4" />
            </CTAButton>
            <CTAButton
              href="/services"
              variant="outline"
              className="px-8 py-4 text-base"
            >
              View Services
            </CTAButton>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-8">
            {trustItems.map((item) => (
              <div
                key={item.label}
                className="glass-panel flex items-center gap-3 rounded-xl px-4 py-3"
              >
                <item.icon className="h-5 w-5 shrink-0 text-brand-purple-400" />
                <span className="text-sm font-medium text-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

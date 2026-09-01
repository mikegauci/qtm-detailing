import { Check } from "lucide-react";
import type { Package } from "@/types/content";
import { formatPrice } from "@/lib/utils";
import { SectionHeading, CTAButton } from "@/components/ui/section-heading";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/fade-in";
import { cn } from "@/lib/utils";

type PricingPreviewSectionProps = {
  packages: Package[];
};

export function PricingPreviewSection({ packages }: PricingPreviewSectionProps) {
  return (
    <section className="section-padding bg-surface-raised/30">
      <div className="container-narrow">
        <FadeIn>
          <SectionHeading
            eyebrow="Packages"
            title="Clear pricing, no surprises"
            description="Choose a package or mix services — we'll tailor a quote to your vehicle's condition."
          />
        </FadeIn>

        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => (
            <StaggerItem key={pkg.id}>
              <div
                className={cn(
                  "glass-panel relative flex h-full flex-col rounded-2xl p-6",
                  pkg.popular &&
                    "border-brand-purple-400/40 glow-purple ring-1 ring-brand-purple-400/20",
                )}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-purple-600 to-brand-cyan-700 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold">{pkg.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {pkg.description}
                </p>
                <p className="mt-4">
                  <span className="text-4xl font-bold text-foreground">
                    {formatPrice(pkg.price)}
                  </span>
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {pkg.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <CTAButton
                  href="/contact"
                  variant={pkg.popular ? "primary" : "outline"}
                  className="mt-8 w-full"
                >
                  Get Started
                </CTAButton>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

import type { Package } from "@/types/content";
import { FeatureList } from "@/components/ui/feature-list";
import type { SectionHeadingContent } from "@/types/page-sections";
import { PageSection } from "@/components/layout/page-section";
import { SectionHeading, CTAButton } from "@/components/ui/section-heading";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/fade-in";
import { cn } from "@/lib/utils";

type PricingPreviewSectionProps = {
  packages: Package[];
  heading: SectionHeadingContent;
  quoteUrl: string;
};

function packageGridClass(count: number) {
  if (count >= 4) {
    return "sm:grid-cols-2 lg:grid-cols-4";
  }
  if (count === 3) {
    return "mx-auto max-w-5xl sm:grid-cols-2 lg:grid-cols-3";
  }
  if (count === 2) {
    return "mx-auto max-w-2xl sm:grid-cols-2";
  }
  return "mx-auto max-w-sm grid-cols-1";
}

export function PricingPreviewSection({
  packages,
  heading,
  quoteUrl,
}: PricingPreviewSectionProps) {
  return (
    <PageSection raised>
        <FadeIn>
          <SectionHeading
            eyebrow={heading.eyebrow}
            title={heading.title}
            description={heading.description}
          />
        </FadeIn>

        <StaggerContainer className={cn("grid gap-6", packageGridClass(packages.length))}>
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
                <FeatureList
                  included={pkg.features}
                  excluded={pkg.excludedFeatures}
                  className="mt-6 flex-1 space-y-3"
                  includedIconClassName="text-brand-cyan-400"
                />
                <CTAButton
                  href={quoteUrl}
                  variant={pkg.popular ? "primary" : "outline"}
                  className="mt-8 w-full"
                >
                  Get Started
                </CTAButton>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
    </PageSection>
  );
}

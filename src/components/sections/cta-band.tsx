import { CTAButton } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/motion/fade-in";
import { cn } from "@/lib/utils";
import type { CtaBandContent } from "@/types/page-sections";
import { defaultCtaBand } from "@/lib/content/cms-defaults";

type CtaBandProps = {
  content?: CtaBandContent;
};

export function CtaBand({ content = defaultCtaBand }: CtaBandProps) {
  return (
    <section
      className={cn(
        "px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28",
        "pt-8 lg:pt-10",
      )}
    >
      <div className="container-narrow">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-purple-900 via-brand-purple-950 to-surface-base px-8 py-16 text-center sm:px-12 lg:py-20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(90_220_242_/_0.15),transparent_50%)]" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {content.title}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                {content.description}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <CTAButton
                  href={content.primaryCta.href}
                  className="px-8 py-4 text-base"
                >
                  {content.primaryCta.label}
                </CTAButton>
                <CTAButton
                  href={content.secondaryCta.href}
                  variant="outline"
                  className="px-8 py-4 text-base"
                >
                  {content.secondaryCta.label}
                </CTAButton>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

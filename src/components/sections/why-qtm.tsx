import { CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/fade-in";
import type { WhyQtmContent } from "@/components/admin/page-copy-editor";

type WhyQtmSectionProps = {
  content: WhyQtmContent;
};

export function WhyQtmSection({ content }: WhyQtmSectionProps) {
  return (
    <section className="section-padding bg-surface-raised/30">
      <div className="container-narrow">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <FadeIn>
            <SectionHeading
              eyebrow={content.eyebrow}
              title={content.title}
              description={content.description}
              align="left"
              className="mb-0"
            />
          </FadeIn>

          <StaggerContainer className="grid gap-4 sm:grid-cols-2">
            {content.reasons.map((reason) => (
              <StaggerItem key={reason.title}>
                <div className="glass-panel rounded-xl p-5">
                  <CheckCircle2 className="mb-3 h-6 w-6 text-brand-cyan-400" />
                  <h3 className="font-semibold text-foreground">
                    {reason.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {reason.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}

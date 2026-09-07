import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/motion/fade-in";
import { WhyQtmAccordion } from "@/components/sections/why-qtm-accordion";
import type { WhyQtmContent } from "@/types/page-sections";

type WhyQtmSectionProps = {
  content: WhyQtmContent;
};

export function WhyQtmSection({ content }: WhyQtmSectionProps) {
  return (
    <section className="section-padding bg-surface-raised/30">
      <div className="container-narrow">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
          <FadeIn>
            <SectionHeading
              eyebrow={content.eyebrow}
              title={content.title}
              description={content.description}
              align="left"
              className="mb-0"
            />
          </FadeIn>

          <FadeIn delay={0.1}>
            <WhyQtmAccordion reasons={content.reasons} />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

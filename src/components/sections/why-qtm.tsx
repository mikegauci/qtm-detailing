import { CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/fade-in";

const reasons = [
  {
    title: "Studio-grade equipment",
    description:
      "Dual-action and rotary polishers, steam extractors, and IR curing — the same tools used in professional body shops.",
  },
  {
    title: "OEM-safe products",
    description:
      "We use Gyeon, Koch Chemie, and CarPro — premium brands trusted by manufacturers worldwide.",
  },
  {
    title: "Transparent process",
    description:
      "Before-and-after documentation, paint depth readings, and clear pricing with no hidden fees.",
  },
  {
    title: "Malta climate expertise",
    description:
      "Coatings and sealants selected specifically for intense UV exposure and coastal salt air.",
  },
];

export function WhyQtmSection() {
  return (
    <section className="section-padding bg-surface-raised/30">
      <div className="container-narrow">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <FadeIn>
            <SectionHeading
              eyebrow="Why QTM Detailing"
              title="Obsessive detail. Lasting results."
              description="We don't rush. Every vehicle gets a personalised treatment plan based on its condition, paint type, and your expectations."
              align="left"
              className="mb-0"
            />
          </FadeIn>

          <StaggerContainer className="grid gap-4 sm:grid-cols-2">
            {reasons.map((reason) => (
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

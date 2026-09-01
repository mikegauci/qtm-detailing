import { Star } from "lucide-react";
import type { Testimonial } from "@/content/testimonials";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/fade-in";

type TestimonialsSectionProps = {
  testimonials: Testimonial[];
};

export function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  return (
    <section className="section-padding">
      <div className="container-narrow">
        <FadeIn>
          <SectionHeading
            eyebrow="Testimonials"
            title="What our customers say"
            description="Real feedback from people who've experienced the QTM difference firsthand."
          />
        </FadeIn>

        <StaggerContainer className="grid gap-6 sm:grid-cols-2">
          {testimonials.map((testimonial) => (
            <StaggerItem key={testimonial.id}>
              <blockquote className="glass-panel h-full rounded-2xl p-6">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-brand-purple-400 text-brand-purple-400"
                    />
                  ))}
                </div>
                <p className="text-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
                <footer className="mt-4 border-t border-border-subtle pt-4">
                  <cite className="not-italic">
                    <span className="font-semibold text-foreground">
                      {testimonial.name}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {testimonial.vehicle}
                    </span>
                  </cite>
                </footer>
              </blockquote>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

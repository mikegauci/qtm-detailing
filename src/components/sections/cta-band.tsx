import { CTAButton } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/motion/fade-in";

export function CtaBand() {
  return (
    <section className="section-padding">
      <div className="container-narrow">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-purple-900 via-brand-purple-950 to-surface-base px-8 py-16 text-center sm:px-12 lg:py-20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(90_220_242_/_0.15),transparent_50%)]" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready for showroom results?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Request a free quote and we&apos;ll get back within 24 hours with
                availability and personalised pricing for your vehicle.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <CTAButton href="/contact" className="px-8 py-4 text-base">
                  Request a Quote
                </CTAButton>
                <CTAButton
                  href="/services"
                  variant="outline"
                  className="px-8 py-4 text-base"
                >
                  Explore Services
                </CTAButton>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

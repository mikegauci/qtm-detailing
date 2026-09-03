import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";
import { SectionHeading, CTAButton } from "@/components/ui/section-heading";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/fade-in";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CtaBand } from "@/components/sections/cta-band";
import { FaqAnswer } from "@/components/faq/faq-answer";
import { HashScroll } from "@/components/services/hash-scroll";
import { cn } from "@/lib/utils";
import {
  defaultCtaBand,
  defaultFaqHeading,
  defaultPricingInfo,
  defaultServicesHero,
} from "@/lib/content/cms-defaults";
import { getFaqs } from "@/lib/content/get-faqs";
import { getPageSection } from "@/lib/content/get-page-section";
import { getServices } from "@/lib/content/get-services";
import { getSiteSettings } from "@/lib/content/get-site-settings";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore QTM Detailing services — premium interior deep clean, exterior detail, paint enhancement, ceramic protection, and signature packages. Premium automotive care in Malta.",
};

export default async function ServicesPage() {
  const [services, faqItems, settings, cta, hero, pricingInfo, faqHeading] =
    await Promise.all([
      getServices(),
      getFaqs(),
      getSiteSettings(),
      getPageSection("home", "cta-band", defaultCtaBand),
      getPageSection("services", "hero", defaultServicesHero),
      getPageSection("services", "pricing-info", defaultPricingInfo),
      getPageSection("services", "faq-heading", defaultFaqHeading),
    ]);

  return (
    <>
      <HashScroll />
      <section className="section-padding pt-32">
        <div className="container-narrow">
          <FadeIn>
            <SectionHeading
              eyebrow={hero.eyebrow}
              title={hero.title}
              description={hero.description}
            />
          </FadeIn>

          <StaggerContainer className="grid gap-8">
            {services.map((service, index) => (
                <StaggerItem key={service.id}>
                  <article
                    id={service.slug}
                    className={cn(
                      "glass-panel grid scroll-mt-28 overflow-hidden rounded-2xl lg:grid-cols-2",
                      index % 2 === 1 && "lg:[&>*:first-child]:order-2",
                    )}
                  >
                    <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[320px]">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                    <div className="flex flex-col justify-center p-6 lg:p-10">
                      <h2 className="text-2xl font-bold">{service.title}</h2>
                      {service.titleSubline && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {service.titleSubline}
                        </p>
                      )}
                      <p className="mt-3 text-muted-foreground">
                        {service.description}
                      </p>
                      {service.includedServices &&
                        service.includedServices.length > 0 && (
                          <ul className="mt-6 space-y-2">
                            {service.includedServices.map((item) => (
                              <li
                                key={item}
                                className="flex items-center gap-2 text-sm text-muted-foreground"
                              >
                                <Check className="h-4 w-4 text-brand-purple-400" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      {service.features.length > 0 && (
                        <ul className="mt-6 space-y-2">
                          {service.features.map((feature) => (
                            <li
                              key={feature}
                              className="flex items-center gap-2 text-sm text-muted-foreground"
                            >
                              <Check className="h-4 w-4 text-brand-purple-400" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                      {service.note && (
                        <p className="mt-4 text-sm text-muted-foreground/80">
                          {service.note}
                        </p>
                      )}
                      <CTAButton href="/contact" className="mt-8 w-fit">
                        Request Quote
                      </CTAButton>
                    </div>
                  </article>
                </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="section-padding bg-surface-raised/30">
        <div className="container-narrow max-w-3xl">
          <FadeIn>
            <SectionHeading eyebrow="Pricing" title={pricingInfo.title} />
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="space-y-4 text-muted-foreground">
              {pricingInfo.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow max-w-3xl">
          <FadeIn>
            <SectionHeading
              eyebrow={faqHeading.eyebrow}
              title={faqHeading.title}
              description={faqHeading.description}
            />
          </FadeIn>

          <FadeIn delay={0.1}>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <FaqAnswer
                      question={item.question}
                      answer={item.answer}
                      whatsappUrl={settings.contact.whatsappUrl}
                      className="text-muted-foreground"
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FadeIn>
        </div>
      </section>

      <CtaBand content={cta} />
    </>
  );
}

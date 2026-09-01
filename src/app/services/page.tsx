import type { Metadata } from "next";
import Image from "next/image";
import { Clock, Check } from "lucide-react";
import { paintProtectionIntro, pricingInformation } from "@/content/services";
import { formatPrice } from "@/lib/utils";
import { SectionHeading, CTAButton } from "@/components/ui/section-heading";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/fade-in";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CtaBand } from "@/components/sections/cta-band";
import { HashScroll } from "@/components/services/hash-scroll";
import { cn } from "@/lib/utils";
import { getServices } from "@/lib/content/get-services";
import { getPackages } from "@/lib/content/get-packages";
import { getFaqs } from "@/lib/content/get-faqs";
import { getPageSection } from "@/lib/content/get-page-section";
import type { CtaBandContent } from "@/components/admin/page-copy-editor";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore QTM Detailing services — premium interior deep clean, exterior detail, paint enhancement, ceramic protection, and signature packages. Premium automotive care in Malta.",
};

const defaultCta: CtaBandContent = {
  title: "Ready for showroom results?",
  description:
    "Request a free quote and we'll get back within 24 hours with availability and personalised pricing for your vehicle.",
  primaryCta: { label: "Request a Quote", href: "/contact" },
  secondaryCta: { label: "Explore Services", href: "/services" },
};

export default async function ServicesPage() {
  const [services, { packages, comparisonFeatures }, faqItems, cta] =
    await Promise.all([
      getServices(),
      getPackages(),
      getFaqs(),
      getPageSection("home", "cta-band", defaultCta),
    ]);

  return (
    <>
      <HashScroll />
      <section className="section-padding pt-32">
        <div className="container-narrow">
          <FadeIn>
            <SectionHeading
              eyebrow="Premium Detailing Services"
              title="Every detail, perfected"
              description="Professional automotive detailing services tailored to your vehicle's needs. All prices in EUR."
            />
          </FadeIn>

          <StaggerContainer className="grid gap-8">
            {services.map((service, index) => {
              const isFirstProtection =
                service.category === "protection" &&
                services.findIndex((s) => s.category === "protection") ===
                  index;

              return (
                <StaggerItem key={service.id}>
                  {isFirstProtection && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold">Paint Protection</h2>
                      <p className="mt-2 text-muted-foreground">
                        {paintProtectionIntro}
                      </p>
                    </div>
                  )}
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
                      <p className="mt-3 text-muted-foreground">
                        {service.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-4 text-sm">
                        <span className="font-semibold text-brand-cyan-400">
                          From {formatPrice(service.priceFrom)}
                        </span>
                        {service.duration && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {service.duration}
                          </span>
                        )}
                      </div>
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
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      <section className="section-padding bg-surface-raised/30">
        <div className="container-narrow">
          <FadeIn>
            <SectionHeading
              eyebrow="Packages"
              title="Bundle and save"
              description="Our packages combine the most popular services at a better value."
            />
          </FadeIn>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="py-4 text-left text-sm font-medium text-muted-foreground">
                    Feature
                  </th>
                  {packages.map((pkg) => (
                    <th
                      key={pkg.id}
                      className="px-4 py-4 text-center text-sm font-semibold"
                    >
                      {pkg.name}
                      <div className="mt-1 text-brand-cyan-400">
                        {formatPrice(pkg.price)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, featureIndex) => (
                  <tr
                    key={feature}
                    className="border-b border-border-subtle/50"
                  >
                    <td className="py-3 text-sm text-muted-foreground">
                      {feature}
                    </td>
                    {packages.map((pkg) => (
                      <td key={pkg.id} className="px-4 py-3 text-center">
                        {pkg.includes[featureIndex] ? (
                          <Check className="mx-auto h-4 w-4 text-brand-cyan-400" />
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section-padding bg-surface-raised/30">
        <div className="container-narrow max-w-3xl">
          <FadeIn>
            <SectionHeading
              eyebrow="Pricing"
              title={pricingInformation.title}
            />
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="space-y-4 text-muted-foreground">
              {pricingInformation.paragraphs.map((paragraph) => (
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
              eyebrow="FAQ"
              title="Common questions"
              description="Everything you need to know before booking."
            />
          </FadeIn>

          <FadeIn delay={0.1}>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
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

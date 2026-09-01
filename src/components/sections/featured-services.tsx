import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { featuredServices } from "@/content/services";
import { formatPrice } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/fade-in";

export function FeaturedServicesSection() {
  return (
    <section className="section-padding bg-surface-base">
      <div className="container-narrow">
        <FadeIn>
          <SectionHeading
            eyebrow="Our Services"
            title="Precision detailing, tailored to you"
            description="From daily drivers to supercars, every vehicle receives the same obsessive attention to detail."
          />
        </FadeIn>

        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredServices.map((service) => (
            <StaggerItem key={service.id}>
              <Link
                href={`/services#${service.slug}`}
                className="group glass-panel block overflow-hidden rounded-2xl transition-all duration-300 hover:border-brand-purple-400/30 hover:glow-purple"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-transparent to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-foreground">
                    {service.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {service.shortDescription}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-brand-cyan-400">
                      From {formatPrice(service.priceFrom)}
                    </span>
                    {service.duration && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {service.duration}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn className="mt-10 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-purple-400 transition-colors hover:text-brand-purple-300"
          >
            View all services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}

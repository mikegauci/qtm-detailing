import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/content/services";
import { SectionHeading } from "@/components/ui/section-heading";
import { ScrollCarousel } from "@/components/ui/scroll-carousel";
import { FadeIn } from "@/components/motion/fade-in";

function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services#${service.slug}`}
      className="group glass-panel flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:border-brand-purple-400/30 hover:glow-purple"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 82vw, (max-width: 1024px) 55vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-transparent to-transparent" />
      </div>
      <div className="p-5">
        <h3 className="line-clamp-2 min-h-14 text-lg font-semibold leading-7 text-foreground">
          {service.title}
        </h3>
        <p className="mt-2 line-clamp-4 h-20 text-sm leading-5 text-muted-foreground">
          {service.shortDescription}
        </p>
      </div>
    </Link>
  );
}

type FeaturedServicesSectionProps = {
  services: Service[];
};

export function FeaturedServicesSection({
  services,
}: FeaturedServicesSectionProps) {
  return (
    <section className="section-padding overflow-x-clip bg-surface-base">
      <div className="container-narrow">
        <FadeIn>
          <SectionHeading
            eyebrow="Our Services"
            title="Precision detailing, tailored to you"
            description="From daily drivers to supercars, every vehicle receives the same obsessive attention to detail."
          />
        </FadeIn>

        <FadeIn className="mt-10">
          <div className="w-[calc(100vw-(100vw-100%)/2)]">
            <ScrollCarousel
              itemClassName="h-full w-[min(82vw,340px)] sm:w-[min(72vw,360px)] md:w-[min(55vw,380px)] lg:w-[min(25vw,300px)]"
            >
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </ScrollCarousel>
          </div>
        </FadeIn>

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

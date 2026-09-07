import type { Testimonial } from "@/lib/content/get-testimonials";
import type { SiteConfig } from "@/types/content";
import { buildLocalBusinessJsonLd } from "@/lib/seo/local-business-schema";

type LocalBusinessJsonLdProps = {
  settings: SiteConfig;
  testimonials?: Testimonial[];
};

export function LocalBusinessJsonLd({
  settings,
  testimonials = [],
}: LocalBusinessJsonLdProps) {
  const jsonLd = buildLocalBusinessJsonLd(settings, testimonials);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

import type { Service, SiteConfig } from "@/types/content";
import { getProductionSiteUrl, joinSiteUrl } from "@/lib/seo/site-url";

type ServicesJsonLdProps = {
  services: Service[];
  settings: SiteConfig;
};

export function ServicesJsonLd({ services, settings }: ServicesJsonLdProps) {
  if (services.length === 0) {
    return null;
  }

  const baseUrl = getProductionSiteUrl(settings);
  const provider = {
    "@type": "AutoRepair",
    name: settings.name,
    url: baseUrl,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.title,
        description: service.shortDescription || service.description,
        url: joinSiteUrl(baseUrl, `/services#${service.slug}`),
        provider,
        areaServed: {
          "@type": "Country",
          name: "Malta",
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

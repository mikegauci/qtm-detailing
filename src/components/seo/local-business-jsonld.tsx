import type { SiteConfig } from "@/types/content";

export function LocalBusinessJsonLd({ settings }: { settings: SiteConfig }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: settings.name,
    description: settings.description,
    url: settings.url,
    telephone: settings.contact.phone,
    email: settings.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.contact.address,
      addressLocality: "Xemxija",
      addressCountry: "MT",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: settings.contact.coordinates.lat,
      longitude: settings.contact.coordinates.lng,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "13:00",
      },
    ],
    priceRange: "€€",
    image: `${settings.url}/qtm-logo.png`,
    sameAs: [settings.social.instagram, settings.social.facebook],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

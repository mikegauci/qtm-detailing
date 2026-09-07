import type { Testimonial } from "@/lib/content/get-testimonials";
import type { SiteConfig } from "@/types/content";
import { buildOpeningHoursSpecification } from "@/lib/seo/opening-hours";
import { getProductionSiteUrl, joinSiteUrl } from "@/lib/seo/site-url";

export function getLocalBusinessId(baseUrl: string): string {
  return `${baseUrl}/#business`;
}

export function buildLocalBusinessJsonLd(
  settings: SiteConfig,
  testimonials: Testimonial[] = [],
) {
  const baseUrl = getProductionSiteUrl(settings);
  const businessId = getLocalBusinessId(baseUrl);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "@id": businessId,
    name: settings.name,
    description: settings.description,
    url: baseUrl,
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
    openingHoursSpecification: buildOpeningHoursSpecification(settings.hours),
    priceRange: settings.seo.priceRange ?? "€€",
    image: joinSiteUrl(baseUrl, "/qtm-logo.png"),
    sameAs: [settings.social.instagram, settings.social.facebook],
  };

  if (testimonials.length > 0) {
    const ratings = testimonials.map((item) => item.rating);
    const averageRating =
      ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(averageRating.toFixed(1)),
      reviewCount: testimonials.length,
      bestRating: 5,
      worstRating: 1,
    };

    jsonLd.review = testimonials.map((testimonial) => ({
      "@type": "Review",
      itemReviewed: { "@id": businessId },
      author: {
        "@type": "Person",
        name: testimonial.name,
      },
      reviewBody: testimonial.quote,
      reviewRating: {
        "@type": "Rating",
        ratingValue: testimonial.rating,
        bestRating: 5,
        worstRating: 1,
      },
    }));
  }

  return jsonLd;
}

import type { Metadata } from "next";
import type { SiteConfig } from "@/types/content";
import type { PageSeoContent } from "@/types/page-sections";
import { getIndexingRobots } from "@/lib/seo/indexing";
import { getProductionSiteUrl, joinSiteUrl } from "@/lib/seo/site-url";

type BuildPageMetadataOptions = {
  settings: SiteConfig;
  seo: PageSeoContent;
  path: string;
  canonicalPath?: string;
  fallbackTitle?: string;
};

export async function buildPageMetadata({
  settings,
  seo,
  path,
  canonicalPath,
  fallbackTitle,
}: BuildPageMetadataOptions): Promise<Metadata> {
  const baseUrl = getProductionSiteUrl(settings);
  const canonical = joinSiteUrl(baseUrl, canonicalPath ?? path);
  const pageUrl = joinSiteUrl(baseUrl, path);

  const pageTitle = seo.title.trim() || fallbackTitle?.trim() || "";
  const description = seo.description.trim() || settings.description;
  const ogTitle =
    seo.ogTitle?.trim() ||
    pageTitle ||
    (path === "/"
      ? `${settings.name} | Premium Automotive Detailing Malta`
      : settings.name);
  const ogDescription = seo.ogDescription?.trim() || description;

  const robots = await getIndexingRobots(settings, Boolean(seo.noindex));

  const metadata: Metadata = {
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      locale: settings.locale,
      url: pageUrl,
      siteName: settings.name,
      title: ogTitle,
      description: ogDescription,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ["/opengraph-image"],
    },
    robots,
  };

  if (path === "/" && !pageTitle) {
    metadata.title = {
      absolute: `${settings.name} | Premium Automotive Detailing Malta`,
    };
  } else if (pageTitle) {
    metadata.title = pageTitle;
  }

  return metadata;
}

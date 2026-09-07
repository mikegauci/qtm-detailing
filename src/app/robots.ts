import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/content/get-site-settings";
import { isIndexableHost } from "@/lib/seo/indexing";
import { getProductionSiteUrl, joinSiteUrl } from "@/lib/seo/site-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();
  const indexable = await isIndexableHost(settings);

  if (!indexable) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const baseUrl = getProductionSiteUrl(settings);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin"],
    },
    sitemap: joinSiteUrl(baseUrl, "/sitemap.xml"),
  };
}

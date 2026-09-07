import type { MetadataRoute } from "next";
import { notFound } from "next/navigation";
import { getSiteSettings } from "@/lib/content/get-site-settings";
import { isIndexableHost } from "@/lib/seo/indexing";
import { getProductionSiteUrl, joinSiteUrl } from "@/lib/seo/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings();
  const indexable = await isIndexableHost(settings);

  if (!indexable) {
    notFound();
  }

  const baseUrl = getProductionSiteUrl(settings);
  const routes = ["/", "/services", "/gallery", "/about", "/contact"];

  return routes.map((route) => ({
    url: joinSiteUrl(baseUrl, route),
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.8,
  }));
}

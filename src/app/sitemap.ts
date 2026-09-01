import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/content/get-site-settings";
import { getOptionalSiteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings();
  const baseUrl = getOptionalSiteUrl() || settings.url;

  const routes = ["", "/services", "/gallery", "/about", "/contact"];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}

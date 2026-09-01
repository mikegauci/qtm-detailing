import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/content/get-site-settings";
import { getOptionalSiteUrl } from "@/lib/env";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();
  const baseUrl = getOptionalSiteUrl() || settings.url;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

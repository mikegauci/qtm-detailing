import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/content/get-site-settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();
  const baseUrl = process.env.SITE_URL || settings.url;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

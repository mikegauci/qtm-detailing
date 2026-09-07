import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";
import { getPageSection } from "@/lib/content/get-page-section";
import { getSiteSettings } from "@/lib/content/get-site-settings";
import type { PageSeoContent } from "@/types/page-sections";

type PageMetadataOptions = {
  pageKey: string;
  path: string;
  defaultSeo: PageSeoContent;
  canonicalPath?: string;
};

export async function getMarketingPageMetadata({
  pageKey,
  path,
  defaultSeo,
  canonicalPath,
}: PageMetadataOptions): Promise<Metadata> {
  const [settings, seo] = await Promise.all([
    getSiteSettings(),
    getPageSection(pageKey, "seo", defaultSeo),
  ]);

  return buildPageMetadata({
    settings,
    seo,
    path,
    canonicalPath,
    fallbackTitle: defaultSeo.title,
  });
}

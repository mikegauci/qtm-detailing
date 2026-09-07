import {
  defaultAboutSeo,
  defaultContactSeo,
  defaultGallerySeo,
  defaultHomeSeo,
  defaultServicesSeo,
} from "@/lib/content/cms-defaults";
import { getPageSection } from "@/lib/content/get-page-section";
import { getSiteSettings } from "@/lib/content/get-site-settings";
import { generateLlmsTxt } from "@/lib/seo/generate-llms-txt";
import { getProductionSiteUrl } from "@/lib/seo/site-url";

export async function GET() {
  const settings = await getSiteSettings();
  const baseUrl = getProductionSiteUrl(settings);

  const [homeSeo, servicesSeo, gallerySeo, aboutSeo, contactSeo] =
    await Promise.all([
      getPageSection("home", "seo", defaultHomeSeo),
      getPageSection("services", "seo", defaultServicesSeo),
      getPageSection("gallery", "seo", defaultGallerySeo),
      getPageSection("about", "seo", defaultAboutSeo),
      getPageSection("contact", "seo", defaultContactSeo),
    ]);

  const body = generateLlmsTxt(
    settings,
    [
      { path: "/", seo: homeSeo },
      { path: "/services", seo: servicesSeo },
      { path: "/gallery", seo: gallerySeo },
      { path: "/about", seo: aboutSeo },
      { path: "/contact", seo: contactSeo },
    ],
    baseUrl,
  );

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

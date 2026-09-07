import { ContactPageContent } from "@/components/contact/contact-page-content";
import { defaultContactHero, defaultContactSeo } from "@/lib/content/cms-defaults";
import { getPageSections } from "@/lib/content/get-page-section";
import { getSiteSettings } from "@/lib/content/get-site-settings";
import { getMarketingPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata() {
  return getMarketingPageMetadata({
    pageKey: "contact",
    path: "/contact",
    defaultSeo: defaultContactSeo,
  });
}

export const revalidate = 3600;

export default async function ContactPage() {
  const [settings, sections] = await Promise.all([
    getSiteSettings(),
    getPageSections("contact", {
      hero: defaultContactHero,
    }),
  ]);

  return <ContactPageContent settings={settings} hero={sections.hero} />;
}

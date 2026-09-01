import type { Metadata } from "next";
import { ContactPageContent } from "@/components/contact/contact-page-content";
import { defaultContactHero } from "@/lib/content/cms-defaults";
import { getPageSection } from "@/lib/content/get-page-section";
import { getSiteSettings } from "@/lib/content/get-site-settings";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Request a quote from QTM Detailing. Fill out our form and we'll respond within 24 hours with availability and pricing.",
};

export default async function ContactPage() {
  const [settings, hero] = await Promise.all([
    getSiteSettings(),
    getPageSection("contact", "hero", defaultContactHero),
  ]);

  return <ContactPageContent settings={settings} hero={hero} />;
}

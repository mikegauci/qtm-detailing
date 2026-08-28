import type { Metadata } from "next";
import { siteConfig } from "@/content/site";
import { ContactPageContent } from "@/components/contact/contact-page-content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Request a quote from QTM Detailing. Fill out our form and we'll respond within 24 hours with availability and pricing.",
};

export default function ContactPage() {
  return <ContactPageContent />;
}

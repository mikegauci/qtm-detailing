import type { SiteConfig } from "@/types/content";
import type { PageSeoContent } from "@/types/page-sections";
import { joinSiteUrl } from "@/lib/seo/site-url";

type LlmsPage = {
  path: string;
  seo: PageSeoContent;
};

export function generateLlmsTxt(
  settings: SiteConfig,
  pages: LlmsPage[],
  baseUrl: string,
): string {
  const lines: string[] = [
    `# ${settings.name}`,
    "",
    `> ${settings.seo.llmsSummary?.trim() || settings.description}`,
    "",
    `- Website: ${baseUrl}`,
    `- Email: ${settings.contact.email}`,
    `- Phone: ${settings.contact.phone}`,
    `- Address: ${settings.contact.address}`,
    "",
    "## Pages",
    "",
  ];

  for (const page of pages) {
    const label = page.seo.title.trim() || settings.name;
    const description = page.seo.description.trim() || settings.description;
    lines.push(`- [${label}](${joinSiteUrl(baseUrl, page.path)}): ${description}`);
  }

  lines.push(
    "",
    "## Services",
    "",
    "Premium automotive detailing in Malta — paint correction, ceramic coating, interior restoration, and signature packages.",
    "",
    "## Contact",
    "",
    `WhatsApp: ${settings.contact.whatsappUrl}`,
    `Instagram: ${settings.social.instagram}`,
    `Facebook: ${settings.social.facebook}`,
  );

  return `${lines.join("\n")}\n`;
}

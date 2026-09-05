import {
  CheckCircle2,
  HelpCircle,
  Home,
  Image,
  Layers,
  Mail,
  Megaphone,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type PageKey = "home" | "services" | "about" | "contact" | "gallery";

export type SectionConfig = {
  id: string;
  label: string;
  description: string;
  icon?: LucideIcon;
  note?: string;
};

export type PageConfig = {
  label: string;
  icon: LucideIcon;
  sections: SectionConfig[];
};

export const PAGE_COPY_NAV: Record<PageKey, PageConfig> = {
  home: {
    label: "Home",
    icon: Home,
    sections: [
      {
        id: "hero",
        label: "Hero",
        icon: Sparkles,
        description: "Homepage headline and intro copy",
      },
      {
        id: "why-qtm",
        label: "Why QTM",
        icon: CheckCircle2,
        description: "Value proposition and reason cards",
      },
      {
        id: "featured-services",
        label: "Featured Services",
        icon: Layers,
        description: "Section above the homepage carousel",
      },
      {
        id: "cta-band",
        label: "CTA band",
        icon: Megaphone,
        description: "Bottom call-to-action strip",
        note: "This CTA also appears on Services, About, Gallery, and Pricing pages.",
      },
    ],
  },
  services: {
    label: "Services",
    icon: Wrench,
    sections: [
      {
        id: "hero",
        label: "Page hero",
        description: "Headline at the top of the Services page",
      },
      {
        id: "pricing-info",
        label: "Pricing info",
        description: "Pricing explanation copy on the Services page",
      },
      {
        id: "faq-heading",
        label: "FAQ heading",
        icon: HelpCircle,
        description: "Heading above the FAQ list (items edited in FAQ admin)",
      },
    ],
  },
  about: {
    label: "About",
    icon: CheckCircle2,
    sections: [
      {
        id: "intro",
        label: "Intro",
        description: "Opening section with mission and images",
      },
      {
        id: "process-steps",
        label: "Process steps",
        description: "How-we-work steps shown on the About page",
      },
    ],
  },
  contact: {
    label: "Contact",
    icon: Mail,
    sections: [
      {
        id: "hero",
        label: "Page hero",
        description: "Headline at the top of the Contact page",
      },
    ],
  },
  gallery: {
    label: "Gallery",
    icon: Image,
    sections: [
      {
        id: "hero",
        label: "Page hero",
        description: "Headline at the top of the Gallery page",
      },
    ],
  },
};

export const PAGE_KEYS = Object.keys(PAGE_COPY_NAV) as PageKey[];

export function getFirstSectionId(page: PageKey): string {
  return PAGE_COPY_NAV[page].sections[0]!.id;
}

export function getSectionConfig(
  page: PageKey,
  sectionId: string,
): SectionConfig | undefined {
  return PAGE_COPY_NAV[page].sections.find((s) => s.id === sectionId);
}

export function hasPreview(page: PageKey, sectionId: string): boolean {
  return (
    page === "home" &&
    (sectionId === "hero" ||
      sectionId === "why-qtm" ||
      sectionId === "cta-band")
  );
}

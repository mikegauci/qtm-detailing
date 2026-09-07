export type PriceTier = {
  label: string;
  price: number;
};

export type PricingItem = {
  slug: string;
  title: string;
  description: string;
  tiers: PriceTier[];
  includes?: string[];
  note?: string;
  warning?: string;
};

export type PricingHero = {
  eyebrow: string;
  title: string;
  description: string;
};

export type PricingSection = {
  id: string;
  heading?: string;
  intro?: string;
  items: PricingItem[];
};

export type PricingImportantInfo = {
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  bullets: string[];
  closingParagraphs: string[];
  ctaLabel?: string;
  ctaHref?: string;
};

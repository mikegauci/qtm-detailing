export type HeroContent = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  mobileImage: string;
  desktopImage: string;
};

export type WhyQtmContent = {
  eyebrow: string;
  title: string;
  description: string;
  reasons: { title: string; description: string }[];
};

export type CtaBandContent = {
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

export type SectionHeadingContent = {
  eyebrow: string;
  title: string;
  description: string;
};

export type AboutIntroContent = SectionHeadingContent & {
  mission: string;
  mobileImage: string;
  desktopImage: string;
};

export type ProcessStepsContent = SectionHeadingContent & {
  steps: { step: string; title: string; description: string }[];
};

export type PricingInfoContent = {
  title: string;
  paragraphs: string[];
};

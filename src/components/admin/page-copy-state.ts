import type { AdminPackageFormState } from "@/app/actions/admin/cms";
import type { PageKey } from "@/components/admin/page-copy-config";
import type {
  AboutIntroContent,
  CtaBandContent,
  HeroContent,
  PageSeoContent,
  PricingInfoContent,
  ProcessStepsContent,
  SectionHeadingContent,
  WhyQtmContent,
} from "@/types/page-sections";

export type PageCopySectionKey =
  | "home:hero"
  | "home:why-qtm"
  | "home:featured-services"
  | "home:packages"
  | "home:cta-band"
  | "home:seo"
  | "services:hero"
  | "services:pricing-info"
  | "services:faq-heading"
  | "services:seo"
  | "about:intro"
  | "about:process-steps"
  | "about:seo"
  | "contact:hero"
  | "contact:seo"
  | "gallery:hero"
  | "gallery:seo";

export type PageCopyState = {
  "home:hero": HeroContent;
  "home:why-qtm": WhyQtmContent;
  "home:featured-services": SectionHeadingContent;
  "home:packages": SectionHeadingContent;
  "home:cta-band": CtaBandContent;
  "home:seo": PageSeoContent;
  "services:hero": SectionHeadingContent;
  "services:pricing-info": PricingInfoContent;
  "services:faq-heading": SectionHeadingContent;
  "services:seo": PageSeoContent;
  "about:intro": AboutIntroContent;
  "about:process-steps": ProcessStepsContent;
  "about:seo": PageSeoContent;
  "contact:hero": SectionHeadingContent;
  "contact:seo": PageSeoContent;
  "gallery:hero": SectionHeadingContent;
  "gallery:seo": PageSeoContent;
};

export type PageCopyEditorInitialProps = {
  hero: HeroContent;
  whyQtm: WhyQtmContent;
  ctaBand: CtaBandContent;
  featuredServices: SectionHeadingContent;
  packagesHeading: SectionHeadingContent;
  packages: AdminPackageFormState[];
  servicesHero: SectionHeadingContent;
  faqHeading: SectionHeadingContent;
  pricingInfo: PricingInfoContent;
  aboutIntro: AboutIntroContent;
  processSteps: ProcessStepsContent;
  contactHero: SectionHeadingContent;
  galleryHero: SectionHeadingContent;
  homeSeo: PageSeoContent;
  servicesSeo: PageSeoContent;
  aboutSeo: PageSeoContent;
  contactSeo: PageSeoContent;
  gallerySeo: PageSeoContent;
};

export const SEO_SECTION_KEYS: Record<PageKey, PageCopySectionKey> = {
  home: "home:seo",
  services: "services:seo",
  about: "about:seo",
  contact: "contact:seo",
  gallery: "gallery:seo",
};

export const PREVIEW_SECTION_KEYS = new Set<PageCopySectionKey>([
  "home:hero",
  "home:why-qtm",
  "home:cta-band",
]);

export function createPageCopyState(
  props: PageCopyEditorInitialProps,
): PageCopyState {
  return {
    "home:hero": props.hero,
    "home:why-qtm": props.whyQtm,
    "home:featured-services": props.featuredServices,
    "home:packages": props.packagesHeading,
    "home:cta-band": props.ctaBand,
    "home:seo": props.homeSeo,
    "services:hero": props.servicesHero,
    "services:pricing-info": props.pricingInfo,
    "services:faq-heading": props.faqHeading,
    "services:seo": props.servicesSeo,
    "about:intro": props.aboutIntro,
    "about:process-steps": props.processSteps,
    "about:seo": props.aboutSeo,
    "contact:hero": props.contactHero,
    "contact:seo": props.contactSeo,
    "gallery:hero": props.galleryHero,
    "gallery:seo": props.gallerySeo,
  };
}

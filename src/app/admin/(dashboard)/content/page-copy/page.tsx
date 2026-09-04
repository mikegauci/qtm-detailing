import { requireAdmin } from "@/lib/supabase/admin";
import { getAdminPageSections } from "@/app/actions/admin/cms";
import {
  PageCopyEditorLazy,
  SitePageCopyEditorLazy,
} from "@/components/admin/lazy/page-copy-editor-lazy";
import {
  defaultAboutIntro,
  defaultContactHero,
  defaultCtaBand,
  defaultFaqHeading,
  defaultFeaturedServicesHeading,
  defaultGalleryHero,
  defaultHero,
  defaultPricingInfo,
  defaultProcessSteps,
  defaultServicesHero,
  defaultWhyQtm,
} from "@/lib/content/cms-defaults";
import type {
  AboutIntroContent,
  CtaBandContent,
  HeroContent,
  PricingInfoContent,
  ProcessStepsContent,
  SectionHeadingContent,
  WhyQtmContent,
} from "@/types/page-sections";

function findSection<T>(
  sections: Awaited<ReturnType<typeof getAdminPageSections>>,
  pageKey: string,
  sectionKey: string,
  fallback: T,
): T {
  const section = sections.find(
    (s) => s.page_key === pageKey && s.section_key === sectionKey,
  );
  return (section?.content as T) ?? fallback;
}

export default async function PageCopyAdminPage() {
  const { supabase } = await requireAdmin();
  const sections = await getAdminPageSections(undefined, supabase);

  const hero = findSection<HeroContent>(sections, "home", "hero", defaultHero);
  const whyQtm = findSection<WhyQtmContent>(
    sections,
    "home",
    "why-qtm",
    defaultWhyQtm,
  );
  const ctaBand = findSection<CtaBandContent>(
    sections,
    "home",
    "cta-band",
    defaultCtaBand,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Page Copy</h1>
        <p className="mt-1 text-white/60">
          Edit headings and copy for each page. All content is stored in the CMS.
        </p>
      </div>

      <PageCopyEditorLazy hero={hero} whyQtm={whyQtm} ctaBand={ctaBand} />

      <SitePageCopyEditorLazy
        featuredServices={findSection<SectionHeadingContent>(
          sections,
          "home",
          "featured-services",
          defaultFeaturedServicesHeading,
        )}
        servicesHero={findSection<SectionHeadingContent>(
          sections,
          "services",
          "hero",
          defaultServicesHero,
        )}
        faqHeading={findSection<SectionHeadingContent>(
          sections,
          "services",
          "faq-heading",
          defaultFaqHeading,
        )}
        pricingInfo={findSection<PricingInfoContent>(
          sections,
          "services",
          "pricing-info",
          defaultPricingInfo,
        )}
        aboutIntro={findSection<AboutIntroContent>(
          sections,
          "about",
          "intro",
          defaultAboutIntro,
        )}
        processSteps={findSection<ProcessStepsContent>(
          sections,
          "about",
          "process-steps",
          defaultProcessSteps,
        )}
        contactHero={findSection<SectionHeadingContent>(
          sections,
          "contact",
          "hero",
          defaultContactHero,
        )}
        galleryHero={findSection<SectionHeadingContent>(
          sections,
          "gallery",
          "hero",
          defaultGalleryHero,
        )}
      />
    </div>
  );
}

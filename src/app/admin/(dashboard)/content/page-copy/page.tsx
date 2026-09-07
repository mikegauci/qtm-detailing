import { requireAdmin } from "@/lib/supabase/admin";
import {
  getAdminPackages,
  getAdminPageSections,
} from "@/app/actions/admin/cms";
import { PageCopyEditorLazy } from "@/components/admin/lazy/page-copy-editor-lazy";
import {
  defaultAboutIntro,
  defaultAboutSeo,
  defaultContactHero,
  defaultContactSeo,
  defaultCtaBand,
  defaultFaqHeading,
  defaultFeaturedServicesHeading,
  defaultGalleryHero,
  defaultGallerySeo,
  defaultHero,
  defaultHomeSeo,
  defaultPackagesHeading,
  defaultPricingInfo,
  defaultProcessSteps,
  defaultServicesHero,
  defaultServicesSeo,
  defaultWhyQtm,
} from "@/lib/content/cms-defaults";
import { getPackages } from "@/lib/content/get-packages";
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
  const [sections, rawPackages, { packages: resolvedPackages }] =
    await Promise.all([
      getAdminPageSections(undefined, supabase),
      getAdminPackages(supabase),
      getPackages(true),
    ]);

  const packagesForEditor = rawPackages.map((row) => {
    const resolved = resolvedPackages.find((pkg) => pkg.id === row.id);

    return {
      id: row.id,
      name: row.name,
      description: row.description ?? "",
      features: resolved?.features ?? row.features ?? [],
      excludedFeatures: row.excluded_features ?? [],
      is_popular: row.is_popular,
      is_active: row.is_active,
    };
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Page Copy</h1>
        <p className="mt-1 text-white/60">
          Edit headings and copy for each page. All content is stored in the CMS.
        </p>
      </div>

      <PageCopyEditorLazy
        hero={findSection<HeroContent>(sections, "home", "hero", defaultHero)}
        whyQtm={findSection<WhyQtmContent>(
          sections,
          "home",
          "why-qtm",
          defaultWhyQtm,
        )}
        ctaBand={findSection<CtaBandContent>(
          sections,
          "home",
          "cta-band",
          defaultCtaBand,
        )}
        featuredServices={findSection<SectionHeadingContent>(
          sections,
          "home",
          "featured-services",
          defaultFeaturedServicesHeading,
        )}
        packagesHeading={findSection<SectionHeadingContent>(
          sections,
          "home",
          "packages",
          defaultPackagesHeading,
        )}
        packages={packagesForEditor}
        homeSeo={findSection<PageSeoContent>(
          sections,
          "home",
          "seo",
          defaultHomeSeo,
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
        servicesSeo={findSection<PageSeoContent>(
          sections,
          "services",
          "seo",
          defaultServicesSeo,
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
        aboutSeo={findSection<PageSeoContent>(
          sections,
          "about",
          "seo",
          defaultAboutSeo,
        )}
        contactHero={findSection<SectionHeadingContent>(
          sections,
          "contact",
          "hero",
          defaultContactHero,
        )}
        contactSeo={findSection<PageSeoContent>(
          sections,
          "contact",
          "seo",
          defaultContactSeo,
        )}
        galleryHero={findSection<SectionHeadingContent>(
          sections,
          "gallery",
          "hero",
          defaultGalleryHero,
        )}
        gallerySeo={findSection<PageSeoContent>(
          sections,
          "gallery",
          "seo",
          defaultGallerySeo,
        )}
      />
    </div>
  );
}

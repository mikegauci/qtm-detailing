import type { SiteConfig } from "@/types/content";
import { defaultSiteConfig } from "@/lib/content/cms-defaults";
import {
  normalizeSiteUrl,
  validateProductionSiteUrl,
} from "@/lib/seo/site-url";

function resolveProductionUrl(url: string | undefined): string {
  const candidate = normalizeSiteUrl(url || defaultSiteConfig.url);
  return validateProductionSiteUrl(candidate) ? defaultSiteConfig.url : candidate;
}

export function mergeSiteConfig(partial: Partial<SiteConfig>): SiteConfig {
  return {
    ...defaultSiteConfig,
    ...partial,
    url: resolveProductionUrl(partial.url),
    seo: {
      ...defaultSiteConfig.seo,
      ...partial.seo,
    },
    contact: {
      ...defaultSiteConfig.contact,
      ...partial.contact,
      coordinates: {
        ...defaultSiteConfig.contact.coordinates,
        ...partial.contact?.coordinates,
      },
    },
    social: {
      ...defaultSiteConfig.social,
      ...partial.social,
    },
    hours: partial.hours?.length ? partial.hours : defaultSiteConfig.hours,
    nav: partial.nav?.length ? partial.nav : defaultSiteConfig.nav,
  };
}

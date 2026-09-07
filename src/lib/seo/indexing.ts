import { headers } from "next/headers";
import type { SiteConfig } from "@/types/content";
import {
  getProductionSiteUrl,
  isPreviewSiteHost,
  normalizeSiteUrl,
} from "@/lib/seo/site-url";

export function getProductionHosts(settings: SiteConfig): Set<string> {
  const hosts = new Set<string>(["qtmdetailing.mt", "www.qtmdetailing.mt"]);

  for (const candidate of [getProductionSiteUrl(settings), settings.url]) {
    try {
      hosts.add(new URL(normalizeSiteUrl(candidate)).host.toLowerCase());
    } catch {
      // Ignore invalid URLs in CMS data.
    }
  }

  return hosts;
}

export async function getRequestHost(): Promise<string | null> {
  const headerStore = await headers();
  return headerStore.get("host")?.split(":")[0]?.toLowerCase() ?? null;
}

/** True only on the production domain(s) — preview/staging hosts stay noindex. */
export async function isIndexableHost(settings: SiteConfig): Promise<boolean> {
  if (process.env.VERCEL_ENV === "preview") {
    return false;
  }

  const host = await getRequestHost();
  if (!host) {
    return process.env.VERCEL_ENV !== "preview";
  }

  if (isPreviewSiteHost(host)) {
    return false;
  }

  return getProductionHosts(settings).has(host);
}

export async function getIndexingRobots(
  settings: SiteConfig,
  pageNoindex = false,
): Promise<{ index: boolean; follow: boolean }> {
  const indexable = (await isIndexableHost(settings)) && !pageNoindex;
  return {
    index: indexable,
    follow: indexable,
  };
}

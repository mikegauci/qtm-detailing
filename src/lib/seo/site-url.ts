import { getOptionalSiteUrl } from "@/lib/env";
import type { SiteConfig } from "@/types/content";

export function normalizeSiteUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

export function joinSiteUrl(base: string, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizeSiteUrl(base)}${normalizedPath}`;
}

/** Canonical production URL from CMS — used for metadata, schema, and sitemap. */
export function getProductionSiteUrl(settings: SiteConfig): string {
  return normalizeSiteUrl(settings.url);
}

/** Optional SITE_URL env override — prefer getProductionSiteUrl for SEO output. */
export function getSiteBaseUrl(settings: SiteConfig): string {
  return normalizeSiteUrl(getOptionalSiteUrl() || settings.url);
}

export function isPreviewSiteHost(host: string): boolean {
  const normalized = host.toLowerCase();
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized.endsWith(".vercel.app")
  );
}

export function validateProductionSiteUrl(url: string): string | null {
  const normalized = normalizeSiteUrl(url);

  if (!normalized) {
    return "Site URL is required.";
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return "Enter a valid URL, e.g. https://www.qtmdetailing.mt";
  }

  if (parsed.protocol !== "https:") {
    return "Site URL must use https.";
  }

  if (isPreviewSiteHost(parsed.host)) {
    return "Site URL cannot be a preview, localhost, or Vercel deployment address.";
  }

  return null;
}

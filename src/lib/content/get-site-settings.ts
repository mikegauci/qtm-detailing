import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { SiteConfig } from "@/types/content";
import { defaultSiteConfig } from "@/lib/content/cms-defaults";
import { CMS_CACHE_TAGS } from "@/lib/content/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";

async function fetchSiteSettings(): Promise<SiteConfig> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "main")
    .maybeSingle();

  if (data?.value && typeof data.value === "object") {
    return data.value as SiteConfig;
  }

  return defaultSiteConfig;
}

const getSiteSettingsCached = unstable_cache(
  fetchSiteSettings,
  [CMS_CACHE_TAGS.settings],
  { tags: [CMS_CACHE_TAGS.settings] },
);

export const getSiteSettings = cache(getSiteSettingsCached);

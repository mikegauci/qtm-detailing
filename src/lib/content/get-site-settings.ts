import type { SiteConfig } from "@/types/content";
import { defaultSiteConfig } from "@/lib/content/cms-defaults";
import { createClient } from "@/lib/supabase/server";

export async function getSiteSettings(): Promise<SiteConfig> {
  const supabase = await createClient();
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

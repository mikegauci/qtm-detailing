import { requireAdmin } from "@/lib/supabase/admin";
import { getAdminSiteSettings } from "@/app/actions/admin/cms";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { defaultSiteConfig } from "@/lib/content/cms-defaults";
import { normalizeSiteUrl } from "@/lib/seo/site-url";
import type { SiteConfig } from "@/types/content";

export default async function SiteSettingsPage() {
  const { supabase } = await requireAdmin();
  const settings = await getAdminSiteSettings(supabase);
  const config = (settings as SiteConfig) ?? defaultSiteConfig;
  const siteUrl = normalizeSiteUrl(config.url);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="mt-1 max-w-2xl text-white/60">
            Global configuration for branding, SEO, contact details, and social
            links. Page-specific copy lives under Page Copy.
          </p>
        </div>
        {siteUrl ? (
          <div className="flex flex-wrap gap-2 text-sm">
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/10 px-3 py-1.5 text-white/70 transition-colors hover:border-white/20 hover:text-white"
            >
              View site
            </a>
            <a
              href={`${siteUrl}/llms.txt`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/10 px-3 py-1.5 text-white/70 transition-colors hover:border-white/20 hover:text-white"
            >
              llms.txt
            </a>
          </div>
        ) : null}
      </div>
      <SiteSettingsForm initialSettings={config} />
    </div>
  );
}

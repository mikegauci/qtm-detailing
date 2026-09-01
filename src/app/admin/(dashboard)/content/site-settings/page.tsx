import { requireAdmin } from "@/lib/supabase/admin";
import { getAdminSiteSettings } from "@/app/actions/admin/cms";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { siteConfig, type SiteConfig } from "@/content/site";

export default async function SiteSettingsPage() {
  await requireAdmin();
  const settings = await getAdminSiteSettings();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="mt-1 text-white/60">
          Edit global site configuration used across the public website.
        </p>
      </div>
      <SiteSettingsForm
        initialSettings={(settings as SiteConfig) ?? siteConfig}
      />
    </div>
  );
}

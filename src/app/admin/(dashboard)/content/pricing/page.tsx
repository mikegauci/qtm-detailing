import { requireAdmin } from "@/lib/supabase/admin";
import {
  getAdminPageSections,
  getAdminPricing,
} from "@/app/actions/admin/cms";
import { PricingEditorLazy } from "@/components/admin/lazy/pricing-editor-lazy";
import {
  pricingHero,
  pricingImportantInfo,
} from "@/lib/content/pricing-data";
import type { PricingHero, PricingImportantInfo } from "@/types/pricing";

function findSection<T>(sections: { section_key: string; content: unknown }[], key: string, fallback: T): T {
  const row = sections.find((section) => section.section_key === key);
  if (row?.content && typeof row.content === "object") {
    return row.content as T;
  }
  return fallback;
}

export const maxDuration = 300;

export default async function AdminPricingPage() {
  const { supabase } = await requireAdmin();
  const [{ sections }, pageSections] = await Promise.all([
    getAdminPricing(supabase),
    getAdminPageSections("pricing", supabase),
  ]);

  const hero = findSection<PricingHero>(pageSections, "hero", pricingHero);
  const importantInfo = findSection<PricingImportantInfo>(
    pageSections,
    "important-info",
    pricingImportantInfo,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pricing</h1>
        <p className="mt-1 text-white/60">
          Manage pricing page content, service tiers, and important information.
        </p>
      </div>
      <PricingEditorLazy
        initialSections={sections}
        hero={hero}
        importantInfo={importantInfo}
      />
    </div>
  );
}

import { cache } from "react";
import { CMS_CACHE_TAGS } from "@/lib/content/cache-tags";
import { createCmsCache } from "@/lib/content/create-cms-cache";
import { getPageSection } from "@/lib/content/get-page-section";
import {
  pricingHero,
  pricingImportantInfo,
  pricingSections,
} from "@/lib/content/pricing-data";
import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/lib/supabase/types";
import type {
  PriceTier,
  PricingHero,
  PricingImportantInfo,
  PricingItem,
  PricingSection,
} from "@/types/pricing";

function parseTiers(value: unknown): PriceTier[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (tier): tier is { label: string; price: number } =>
        typeof tier === "object" &&
        tier !== null &&
        typeof (tier as { label?: unknown }).label === "string" &&
        typeof (tier as { price?: unknown }).price === "number",
    )
    .map((tier) => ({ label: tier.label, price: tier.price }));
}

function mapDbItem(row: Tables<"pricing_items">): PricingItem {
  const includes = row.includes?.length ? row.includes : undefined;
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    tiers: parseTiers(row.tiers),
    includes,
    note: row.note ?? undefined,
    warning: row.warning ?? undefined,
  };
}

function mapDbSections(
  sections: Tables<"pricing_sections">[],
  items: Tables<"pricing_items">[],
): PricingSection[] {
  const itemsBySection = new Map<string, Tables<"pricing_items">[]>();
  for (const item of items) {
    const list = itemsBySection.get(item.section_id) ?? [];
    list.push(item);
    itemsBySection.set(item.section_id, list);
  }

  return sections.map((section) => ({
    id: section.slug,
    heading: section.heading ?? undefined,
    intro: section.intro ?? undefined,
    items: (itemsBySection.get(section.id) ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(mapDbItem),
  }));
}

async function fetchPricingSections(): Promise<PricingSection[]> {
  const supabase = createPublicClient();
  const [{ data: sections }, { data: items }] = await Promise.all([
    supabase
      .from("pricing_sections")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("pricing_items")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  if (!sections?.length) {
    return pricingSections;
  }

  const mapped = mapDbSections(sections, items ?? []);
  const totalItems = mapped.reduce((sum, section) => sum + section.items.length, 0);

  if (totalItems === 0) {
    return pricingSections;
  }

  const defaultBySlug = new Map(pricingSections.map((section) => [section.id, section]));

  return mapped.map((section) => {
    if (section.items.length > 0) return section;
    return defaultBySlug.get(section.id) ?? section;
  });
}

const getPricingSectionsCached = createCmsCache(
  CMS_CACHE_TAGS.pricing,
  ["sections"],
  fetchPricingSections,
);

export const getPricingHero = cache(async (): Promise<PricingHero> => {
  return getPageSection("pricing", "hero", pricingHero);
});

export const getPricingImportantInfo = cache(
  async (): Promise<PricingImportantInfo> => {
    return getPageSection("pricing", "important-info", pricingImportantInfo);
  },
);

export async function getPricingSections(): Promise<PricingSection[]> {
  return getPricingSectionsCached();
}

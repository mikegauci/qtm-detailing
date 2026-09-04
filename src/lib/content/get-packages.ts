import { unstable_cache } from "next/cache";
import type { Package, Service } from "@/types/content";
import { CMS_CACHE_TAGS } from "@/lib/content/cache-tags";
import { resolvePackageFeatures, resolvePackageIncludes } from "@/lib/content/package-includes";
import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/lib/supabase/types";

function parseIncludedServices(features: string[] | null): string[] {
  return (features ?? [])
    .filter((feature) => feature.startsWith("Includes: "))
    .map((feature) => feature.slice("Includes: ".length));
}

export function buildIncludedServicesBySlug(
  services: { slug: string; features: string[] | null }[],
): Map<string, string[]> {
  return new Map(
    services.map((service) => [
      service.slug,
      parseIncludedServices(service.features),
    ]),
  );
}

export function buildIncludedServicesBySlugFromServices(
  services: Service[],
): Map<string, string[]> {
  return new Map(
    services
      .filter((service) => service.category === "bundle")
      .map((service) => [service.slug, service.includedServices ?? []]),
  );
}

function mapDbPackage(
  row: Tables<"packages">,
  comparisonFeatures: string[],
  includedServicesBySlug: Map<string, string[]>,
): Package {
  const featureCount = comparisonFeatures.length;
  const storedIncludes = Array.isArray(row.includes)
    ? (row.includes as boolean[]).slice(0, featureCount)
    : [];

  while (storedIncludes.length < featureCount) {
    storedIncludes.push(false);
  }

  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    description: row.description ?? "",
    popular: row.is_popular,
    features: resolvePackageFeatures(
      row.name,
      includedServicesBySlug,
      row.features ?? [],
    ),
    includes: resolvePackageIncludes(
      row.name,
      comparisonFeatures,
      includedServicesBySlug,
      storedIncludes,
    ),
  };
}

export function resolvePackageRecord(
  row: Tables<"packages">,
  comparisonFeatures: string[],
  includedServicesBySlug: Map<string, string[]>,
): Tables<"packages"> {
  const mapped = mapDbPackage(row, comparisonFeatures, includedServicesBySlug);

  return {
    ...row,
    features: mapped.features,
    includes: mapped.includes,
  };
}

export type PackagesData = {
  packages: Package[];
  comparisonFeatures: string[];
};

async function fetchPackages(includeInactive: boolean): Promise<PackagesData> {
  const supabase = createPublicClient();

  const featuresQuery = supabase
    .from("comparison_features")
    .select("label, sort_order")
    .order("sort_order", { ascending: true });

  let packagesQuery = supabase
    .from("packages")
    .select("*")
    .order("sort_order", { ascending: true });

  let servicesQuery = supabase
    .from("services")
    .select("slug, features")
    .eq("category", "bundle")
    .order("sort_order", { ascending: true });

  if (!includeInactive) {
    packagesQuery = packagesQuery.eq("is_active", true);
    servicesQuery = servicesQuery.eq("is_active", true);
  }

  const [{ data: features }, { data: packages, error }, { data: services }] =
    await Promise.all([featuresQuery, packagesQuery, servicesQuery]);

  if (error || !packages?.length) {
    return { packages: [], comparisonFeatures: [] };
  }

  const comparisonFeatures = features?.map((f) => f.label) ?? [];
  const includedServicesBySlug = buildIncludedServicesBySlug(services ?? []);

  return {
    packages: packages.map((pkg) =>
      mapDbPackage(pkg, comparisonFeatures, includedServicesBySlug),
    ),
    comparisonFeatures,
  };
}

const getActivePackagesCached = unstable_cache(
  () => fetchPackages(false),
  [CMS_CACHE_TAGS.packages, "active"],
  { tags: [CMS_CACHE_TAGS.packages] },
);

export async function getPackages(
  includeInactive = false,
): Promise<PackagesData> {
  if (includeInactive) {
    return fetchPackages(true);
  }

  return getActivePackagesCached();
}

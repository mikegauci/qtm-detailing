import {
  packages as staticPackages,
  comparisonFeatures as staticComparisonFeatures,
  type Package,
} from "@/content/packages";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

function mapDbPackage(
  row: Tables<"packages">,
  featureCount: number,
): Package {
  const includes = Array.isArray(row.includes)
    ? (row.includes as boolean[]).slice(0, featureCount)
    : [];

  while (includes.length < featureCount) {
    includes.push(false);
  }

  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    description: row.description ?? "",
    popular: row.is_popular,
    features: row.features ?? [],
    includes,
  };
}

export type PackagesData = {
  packages: Package[];
  comparisonFeatures: string[];
};

export async function getPackages(
  includeInactive = false,
): Promise<PackagesData> {
  const supabase = await createClient();

  const featuresQuery = supabase
    .from("comparison_features")
    .select("*")
    .order("sort_order", { ascending: true });

  let packagesQuery = supabase
    .from("packages")
    .select("*")
    .order("sort_order", { ascending: true });

  if (!includeInactive) {
    packagesQuery = packagesQuery.eq("is_active", true);
  }

  const [{ data: features }, { data: packages, error }] = await Promise.all([
    featuresQuery,
    packagesQuery,
  ]);

  if (error || !packages?.length) {
    return {
      packages: staticPackages,
      comparisonFeatures: staticComparisonFeatures,
    };
  }

  const comparisonFeatures =
    features?.length && features.length > 0
      ? features.map((f) => f.label)
      : staticComparisonFeatures;

  return {
    packages: packages.map((pkg) =>
      mapDbPackage(pkg, comparisonFeatures.length),
    ),
    comparisonFeatures,
  };
}

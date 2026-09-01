import type { Service } from "@/types/content";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

function mapDbService(row: Tables<"services">): Service {
  const includedServices: string[] = [];
  const features: string[] = [];

  for (const feature of row.features ?? []) {
    if (feature.startsWith("Includes: ")) {
      includedServices.push(feature.slice("Includes: ".length));
    } else {
      features.push(feature);
    }
  }

  return {
    id: row.id,
    title: row.name,
    slug: row.slug,
    shortDescription: row.short_description ?? "",
    description: row.description ?? "",
    features,
    includedServices:
      includedServices.length > 0 ? includedServices : undefined,
    image: row.image_url ?? "",
    featured: row.featured,
    category: (row.category as Service["category"]) ?? undefined,
  };
}

export async function getServices(options?: {
  featuredOnly?: boolean;
  includeInactive?: boolean;
}): Promise<Service[]> {
  const supabase = await createClient();
  let query = supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });

  if (!options?.includeInactive) {
    query = query.eq("is_active", true);
  }

  if (options?.featuredOnly) {
    query = query.eq("featured", true);
  }

  const { data, error } = await query;

  if (error || !data?.length) {
    return [];
  }

  return data.map(mapDbService);
}

export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  const services = await getServices();
  return services.find((s) => s.slug === slug);
}

import { unstable_cache } from "next/cache";
import type { Service } from "@/types/content";
import { CMS_CACHE_TAGS } from "@/lib/content/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/lib/supabase/types";
import { parseServiceImages } from "@/lib/content/service-images";

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

  const images = parseServiceImages(row.images, row.image_url);

  return {
    id: row.id,
    title: row.name,
    slug: row.slug,
    shortDescription: row.short_description ?? "",
    description: row.description ?? "",
    titleSubline: row.title_subline ?? undefined,
    features,
    includedServices:
      includedServices.length > 0 ? includedServices : undefined,
    image: images[0]?.url ?? row.image_url ?? "",
    images,
    featured: row.featured,
    category: (row.category as Service["category"]) ?? undefined,
  };
}

async function fetchServices(options?: {
  featuredOnly?: boolean;
  includeInactive?: boolean;
}): Promise<Service[]> {
  const supabase = createPublicClient();
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

const getAllServicesCached = unstable_cache(
  () => fetchServices(),
  [CMS_CACHE_TAGS.services, "all"],
  { tags: [CMS_CACHE_TAGS.services] },
);

const getFeaturedServicesCached = unstable_cache(
  () => fetchServices({ featuredOnly: true }),
  [CMS_CACHE_TAGS.services, "featured"],
  { tags: [CMS_CACHE_TAGS.services] },
);

export async function getServices(options?: {
  featuredOnly?: boolean;
  includeInactive?: boolean;
}): Promise<Service[]> {
  if (options?.includeInactive) {
    return fetchServices(options);
  }

  if (options?.featuredOnly) {
    return getFeaturedServicesCached();
  }

  return getAllServicesCached();
}

export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  const services = await getServices();
  return services.find((s) => s.slug === slug);
}

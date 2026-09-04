import { CMS_CACHE_TAGS } from "@/lib/content/cache-tags";
import { createCmsCache } from "@/lib/content/create-cms-cache";
import { createPublicClient } from "@/lib/supabase/public";

export type Testimonial = {
  id: string;
  name: string;
  vehicle: string;
  quote: string;
  rating: number;
};

function mapDbReview(row: {
  id: string;
  customer_name: string | null;
  vehicle: string | null;
  comment: string | null;
  rating: number;
}): Testimonial {
  return {
    id: row.id,
    name: row.customer_name ?? "Customer",
    vehicle: row.vehicle ?? "",
    quote: row.comment ?? "",
    rating: row.rating,
  };
}

async function fetchTestimonials(
  includeUnpublished: boolean,
): Promise<Testimonial[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from("reviews")
    .select("id, customer_name, vehicle, comment, rating, is_published, created_at")
    .order("created_at", { ascending: false });

  if (!includeUnpublished) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;

  if (error || !data?.length) {
    return [];
  }

  return data.map(mapDbReview);
}

const getPublishedTestimonialsCached = createCmsCache(
  CMS_CACHE_TAGS.testimonials,
  ["published"],
  () => fetchTestimonials(false),
);

export async function getTestimonials(
  includeUnpublished = false,
): Promise<Testimonial[]> {
  if (includeUnpublished) {
    return fetchTestimonials(true);
  }

  return getPublishedTestimonialsCached();
}

import {
  testimonials as staticTestimonials,
  type Testimonial,
} from "@/content/testimonials";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

function mapDbReview(row: Tables<"reviews">): Testimonial {
  return {
    id: row.id,
    name: row.customer_name ?? "Customer",
    vehicle: row.vehicle ?? "",
    quote: row.comment ?? "",
    rating: row.rating,
  };
}

export async function getTestimonials(
  includeUnpublished = false,
): Promise<Testimonial[]> {
  const supabase = await createClient();
  let query = supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (!includeUnpublished) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;

  if (error || !data?.length) {
    return staticTestimonials;
  }

  return data.map(mapDbReview);
}

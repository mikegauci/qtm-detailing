import { faqItems as staticFaqs, type FaqItem } from "@/content/faq";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

function mapDbFaq(row: Tables<"faqs">): FaqItem {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
  };
}

export async function getFaqs(includeInactive = false): Promise<FaqItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error || !data?.length) {
    return staticFaqs;
  }

  return data.map(mapDbFaq);
}

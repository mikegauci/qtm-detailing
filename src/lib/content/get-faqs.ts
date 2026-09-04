import type { FaqItem } from "@/types/content";
import { sanitizeFaqAnswer } from "@/lib/content/sanitize-faq-answer";
import { CMS_CACHE_TAGS } from "@/lib/content/cache-tags";
import { createCmsCache } from "@/lib/content/create-cms-cache";
import { createPublicClient } from "@/lib/supabase/public";

function mapDbFaq(row: {
  id: string;
  question: string;
  answer: string;
}): FaqItem {
  return {
    id: row.id,
    question: row.question,
    answer: sanitizeFaqAnswer(row.answer),
  };
}

async function fetchFaqs(includeInactive: boolean): Promise<FaqItem[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from("faqs")
    .select("id, question, answer, sort_order, is_active")
    .order("sort_order", { ascending: true });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error || !data?.length) {
    return [];
  }

  return data.map(mapDbFaq);
}

const getActiveFaqsCached = createCmsCache(
  CMS_CACHE_TAGS.faqs,
  ["active"],
  () => fetchFaqs(false),
);

export async function getFaqs(includeInactive = false): Promise<FaqItem[]> {
  if (includeInactive) {
    return fetchFaqs(true);
  }

  return getActiveFaqsCached();
}

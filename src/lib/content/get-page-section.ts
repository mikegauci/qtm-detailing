import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

export async function getPageSection<T extends Json>(
  pageKey: string,
  sectionKey: string,
  fallback: T,
): Promise<T> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("page_sections")
    .select("content")
    .eq("page_key", pageKey)
    .eq("section_key", sectionKey)
    .maybeSingle();

  if (data?.content && typeof data.content === "object") {
    return data.content as T;
  }

  return fallback;
}

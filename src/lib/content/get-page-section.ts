import { cache } from "react";
import { unstable_cache } from "next/cache";
import { CMS_CACHE_TAGS } from "@/lib/content/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";
import type { Json } from "@/lib/supabase/types";

async function fetchPageSection<T extends Json>(
  pageKey: string,
  sectionKey: string,
  fallback: T,
): Promise<T> {
  const supabase = createPublicClient();
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

export const getPageSection = cache(
  async <T extends Json>(
    pageKey: string,
    sectionKey: string,
    fallback: T,
  ): Promise<T> => {
    return unstable_cache(
      () => fetchPageSection(pageKey, sectionKey, fallback),
      [CMS_CACHE_TAGS.sections, pageKey, sectionKey],
      { tags: [CMS_CACHE_TAGS.sections] },
    )();
  },
);

export const getPageSections = cache(
  async <T extends Record<string, Json>>(
    pageKey: string,
    fallbacks: T,
  ): Promise<{ [K in keyof T]: T[K] }> => {
    const sectionKeys = Object.keys(fallbacks);

    return unstable_cache(
      async () => {
        const supabase = createPublicClient();
        const { data } = await supabase
          .from("page_sections")
          .select("section_key, content")
          .eq("page_key", pageKey)
          .in("section_key", sectionKeys);

        const contentByKey = new Map(
          (data ?? []).map((row) => [row.section_key, row.content]),
        );

        const result = { ...fallbacks };

        for (const key of sectionKeys) {
          const content = contentByKey.get(key);
          if (content && typeof content === "object") {
            result[key as keyof T] = content as T[keyof T];
          }
        }

        return result;
      },
      [CMS_CACHE_TAGS.sections, pageKey, ...sectionKeys],
      { tags: [CMS_CACHE_TAGS.sections] },
    )();
  },
);

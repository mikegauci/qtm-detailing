import { unstable_cache } from "next/cache";
import { CMS_CACHE_TAGS } from "@/lib/content/cache-tags";

type CmsCacheTag = (typeof CMS_CACHE_TAGS)[keyof typeof CMS_CACHE_TAGS];

export function createCmsCache<T>(
  tag: CmsCacheTag,
  keyParts: string[],
  fetcher: () => Promise<T>,
) {
  return unstable_cache(fetcher, [tag, ...keyParts], { tags: [tag] });
}

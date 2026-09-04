import { revalidatePath, updateTag } from "next/cache";
import { CMS_CACHE_TAGS, CMS_CACHE_TAGS_ALL } from "@/lib/content/cache-tags";

export function revalidatePublicContent() {
  for (const tag of CMS_CACHE_TAGS_ALL) {
    updateTag(tag);
  }

  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/gallery");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/pricing");
}

export function revalidateGalleryContent() {
  updateTag(CMS_CACHE_TAGS.gallery);
  revalidatePath("/gallery");
}

export function revalidateAdminContent() {
  revalidatePath("/admin");
  revalidatePath("/admin/content/site-settings");
  revalidatePath("/admin/content/services");
  revalidatePath("/admin/content/testimonials");
  revalidatePath("/admin/content/faqs");
  revalidatePath("/admin/content/page-copy");
}

export function revalidateAllContent() {
  revalidatePublicContent();
  revalidateAdminContent();
}

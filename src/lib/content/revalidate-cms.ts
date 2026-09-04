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

export function revalidateBookings(options?: {
  bookingId?: string;
  customerId?: string;
  scope?: "list" | "full";
}) {
  const scope = options?.scope ?? "full";

  revalidatePath("/admin/bookings");

  if (options?.bookingId) {
    revalidatePath(`/admin/bookings/${options.bookingId}`);
  }

  if (scope === "full") {
    revalidatePath("/admin/calendar");
    revalidatePath("/admin/kanban");
    revalidatePath("/admin");
  }

  if (options?.customerId) {
    revalidatePath(`/admin/customers/${options.customerId}`);
  }
}

export function revalidateCustomers(options?: {
  customerId?: string;
  includeBookings?: boolean;
  includeBookingsNew?: boolean;
}) {
  revalidatePath("/admin/customers");
  revalidatePath("/admin");

  if (options?.customerId) {
    revalidatePath(`/admin/customers/${options.customerId}`);
  }

  if (options?.includeBookingsNew) {
    revalidatePath("/admin/bookings/new");
  }

  if (options?.includeBookings) {
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/bookings/new");
    revalidatePath("/admin/calendar");
    revalidatePath("/admin/kanban");
    revalidatePath("/admin/leads");
  }
}

export function revalidateLeads(options?: { includeCustomers?: boolean }) {
  revalidatePath("/admin/leads");
  revalidatePath("/admin");

  if (options?.includeCustomers) {
    revalidatePath("/admin/customers");
  }
}

export function revalidateInventory() {
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
}

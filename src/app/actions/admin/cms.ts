"use server";

import { revalidatePath } from "next/cache";
import { siteConfig } from "@/content/site";
import { services as staticServices } from "@/content/services";
import {
  packages as staticPackages,
  comparisonFeatures as staticComparisonFeatures,
} from "@/content/packages";
import { faqItems as staticFaqs } from "@/content/faq";
import { testimonials as staticTestimonials } from "@/content/testimonials";
import { requireAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";

export type ActionResult = {
  success: boolean;
  message: string;
};

function revalidateContent() {
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/gallery");
  revalidatePath("/admin");
  revalidatePath("/admin/content/site-settings");
  revalidatePath("/admin/content/services");
  revalidatePath("/admin/content/packages");
  revalidatePath("/admin/content/testimonials");
  revalidatePath("/admin/content/faqs");
  revalidatePath("/admin/content/page-copy");
}

export async function upsertSiteSettings(
  value: Json,
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("site_settings").upsert({
      key: "main",
      value,
      updated_at: new Date().toISOString(),
    });

    if (error) return { success: false, message: error.message };
    revalidateContent();
    return { success: true, message: "Site settings saved." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to save settings.",
    };
  }
}

export async function upsertService(input: {
  id?: string;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  price: number;
  price_suv?: number;
  price_van?: number;
  estimated_duration_minutes: number;
  featured?: boolean;
  features?: string[];
  image_url?: string;
  category?: string;
  is_active?: boolean;
  sort_order?: number;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const payload = {
      name: input.name,
      slug: input.slug,
      short_description: input.short_description ?? null,
      description: input.description ?? null,
      price: input.price,
      price_suv: input.price_suv ?? input.price,
      price_van: input.price_van ?? input.price,
      estimated_duration_minutes: input.estimated_duration_minutes,
      featured: input.featured ?? false,
      features: input.features ?? [],
      image_url: input.image_url ?? null,
      category: input.category ?? null,
      is_active: input.is_active ?? true,
      sort_order: input.sort_order ?? 0,
    };

    const { error } = input.id
      ? await supabase.from("services").update(payload).eq("id", input.id)
      : await supabase.from("services").insert(payload);

    if (error) return { success: false, message: error.message };
    revalidateContent();
    return { success: true, message: "Service saved." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to save service.",
    };
  }
}

export async function deleteService(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return { success: false, message: error.message };
    revalidateContent();
    return { success: true, message: "Service deleted." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to delete service.",
    };
  }
}

export async function upsertPackage(input: {
  id?: string;
  name: string;
  price: number;
  description?: string;
  is_popular?: boolean;
  features?: string[];
  includes?: boolean[];
  sort_order?: number;
  is_active?: boolean;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const payload = {
      name: input.name,
      price: input.price,
      description: input.description ?? null,
      is_popular: input.is_popular ?? false,
      features: input.features ?? [],
      includes: input.includes ?? [],
      sort_order: input.sort_order ?? 0,
      is_active: input.is_active ?? true,
    };

    const { error } = input.id
      ? await supabase.from("packages").update(payload).eq("id", input.id)
      : await supabase.from("packages").insert(payload);

    if (error) return { success: false, message: error.message };
    revalidateContent();
    return { success: true, message: "Package saved." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to save package.",
    };
  }
}

export async function upsertComparisonFeature(input: {
  id?: string;
  label: string;
  sort_order?: number;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const payload = {
      label: input.label,
      sort_order: input.sort_order ?? 0,
    };

    const { error } = input.id
      ? await supabase
          .from("comparison_features")
          .update(payload)
          .eq("id", input.id)
      : await supabase.from("comparison_features").insert(payload);

    if (error) return { success: false, message: error.message };
    revalidateContent();
    return { success: true, message: "Comparison feature saved." };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Failed to save comparison feature.",
    };
  }
}

export async function deleteComparisonFeature(
  id: string,
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("comparison_features")
      .delete()
      .eq("id", id);
    if (error) return { success: false, message: error.message };
    revalidateContent();
    return { success: true, message: "Comparison feature deleted." };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Failed to delete comparison feature.",
    };
  }
}

export async function upsertFaq(input: {
  id?: string;
  question: string;
  answer: string;
  category?: string;
  sort_order?: number;
  is_active?: boolean;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const payload = {
      question: input.question,
      answer: input.answer,
      category: input.category ?? null,
      sort_order: input.sort_order ?? 0,
      is_active: input.is_active ?? true,
    };

    const { error } = input.id
      ? await supabase.from("faqs").update(payload).eq("id", input.id)
      : await supabase.from("faqs").insert(payload);

    if (error) return { success: false, message: error.message };
    revalidateContent();
    return { success: true, message: "FAQ saved." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to save FAQ.",
    };
  }
}

export async function deleteFaq(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (error) return { success: false, message: error.message };
    revalidateContent();
    return { success: true, message: "FAQ deleted." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to delete FAQ.",
    };
  }
}

export async function upsertTestimonial(input: {
  id?: string;
  customer_name: string;
  vehicle?: string;
  comment: string;
  rating: number;
  is_published?: boolean;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const payload = {
      customer_name: input.customer_name,
      vehicle: input.vehicle ?? null,
      comment: input.comment,
      rating: input.rating,
      is_published: input.is_published ?? true,
    };

    const { error } = input.id
      ? await supabase.from("reviews").update(payload).eq("id", input.id)
      : await supabase.from("reviews").insert(payload);

    if (error) return { success: false, message: error.message };
    revalidateContent();
    return { success: true, message: "Testimonial saved." };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Failed to save testimonial.",
    };
  }
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return { success: false, message: error.message };
    revalidateContent();
    return { success: true, message: "Testimonial deleted." };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Failed to delete testimonial.",
    };
  }
}

export async function upsertPageSection(input: {
  page_key: string;
  section_key: string;
  content: Json;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("page_sections").upsert(
      {
        page_key: input.page_key,
        section_key: input.section_key,
        content: input.content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "page_key,section_key" },
    );

    if (error) return { success: false, message: error.message };
    revalidateContent();
    return { success: true, message: "Page section saved." };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Failed to save page section.",
    };
  }
}

const defaultHeroContent = {
  eyebrow: "Malta's Premium Detailing Studio",
  titleLine1: "Showroom-grade",
  titleLine2: "detailing for every drive",
  description:
    "Paint correction, ceramic coating, and interior restoration, crafted with precision for Malta's most discerning drivers.",
  primaryCta: { label: "Request a Quote", href: "/contact" },
  secondaryCta: { label: "View Services", href: "/services" },
  mobileImage: "/about-page-mobile.jpg",
  desktopImage: "/about-page.jpg",
};

const defaultWhyQtmContent = {
  eyebrow: "Why QTM Detailing",
  title: "Obsessive detail. Lasting results.",
  description:
    "We don't rush. Every vehicle gets a personalised treatment plan based on its condition, paint type, and your expectations.",
  reasons: [
    {
      title: "Studio-grade equipment",
      description:
        "Dual-action and rotary polishers, steam extractors, and IR curing — the same tools used in professional body shops.",
    },
    {
      title: "OEM-safe products",
      description:
        "We use Gyeon, Koch Chemie, and CarPro — premium brands trusted by manufacturers worldwide.",
    },
    {
      title: "Transparent process",
      description:
        "Before-and-after documentation, paint depth readings, and clear pricing with no hidden fees.",
    },
    {
      title: "Malta climate expertise",
      description:
        "Coatings and sealants selected specifically for intense UV exposure and coastal salt air.",
    },
  ],
};

const defaultCtaContent = {
  title: "Ready for showroom results?",
  description:
    "Request a free quote and we'll get back within 24 hours with availability and personalised pricing for your vehicle.",
  primaryCta: { label: "Request a Quote", href: "/contact" },
  secondaryCta: { label: "Explore Services", href: "/services" },
};

export async function seedContentFromStatic(): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    await supabase.from("site_settings").upsert({
      key: "main",
      value: siteConfig as unknown as Json,
      updated_at: new Date().toISOString(),
    });

    for (const [index, service] of staticServices.entries()) {
      const features = [
        ...service.features,
        ...(service.includedServices?.map((s) => `Includes: ${s}`) ?? []),
      ];

      const payload = {
        slug: service.slug,
        name: service.title,
        short_description: service.shortDescription,
        description: service.note
          ? `${service.description}\n\n${service.note}`
          : service.description,
        price: service.priceFrom,
        price_suv: service.priceFrom,
        price_van: service.priceFrom,
        estimated_duration_minutes: 480,
        featured: service.featured ?? false,
        features,
        image_url: service.image,
        category: service.category ?? null,
        is_active: true,
        sort_order: index,
      };

      const { data: existing } = await supabase
        .from("services")
        .select("id")
        .eq("slug", service.slug)
        .maybeSingle();

      if (existing?.id) {
        await supabase.from("services").update(payload).eq("id", existing.id);
      } else {
        await supabase.from("services").insert(payload);
      }
    }

    const { data: existingFeatures } = await supabase
      .from("comparison_features")
      .select("id");

    if (!existingFeatures?.length) {
      for (const [index, label] of staticComparisonFeatures.entries()) {
        await supabase.from("comparison_features").insert({
          label,
          sort_order: index,
        });
      }
    }

    for (const [index, pkg] of staticPackages.entries()) {
      const payload = {
        name: pkg.name,
        price: pkg.price,
        description: pkg.description,
        is_popular: pkg.popular ?? false,
        features: pkg.features,
        includes: pkg.includes,
        sort_order: index,
        is_active: true,
      };

      const { data: existing } = await supabase
        .from("packages")
        .select("id")
        .eq("name", pkg.name)
        .maybeSingle();

      if (existing?.id) {
        await supabase.from("packages").update(payload).eq("id", existing.id);
      } else {
        await supabase.from("packages").insert(payload);
      }
    }

    const { count: faqCount } = await supabase
      .from("faqs")
      .select("*", { count: "exact", head: true });

    if (!faqCount) {
      for (const [index, faq] of staticFaqs.entries()) {
        await supabase.from("faqs").insert({
          question: faq.question,
          answer: faq.answer,
          sort_order: index,
          is_active: true,
        });
      }
    }

    const { count: reviewCount } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true });

    if (!reviewCount) {
      for (const testimonial of staticTestimonials) {
        await supabase.from("reviews").insert({
          customer_name: testimonial.name,
          vehicle: testimonial.vehicle,
          comment: testimonial.quote,
          rating: testimonial.rating,
          is_published: true,
        });
      }
    }

    await supabase.from("page_sections").upsert(
      [
        {
          page_key: "home",
          section_key: "hero",
          content: defaultHeroContent as unknown as Json,
        },
        {
          page_key: "home",
          section_key: "why-qtm",
          content: defaultWhyQtmContent as unknown as Json,
        },
        {
          page_key: "home",
          section_key: "cta-band",
          content: defaultCtaContent as unknown as Json,
        },
      ],
      { onConflict: "page_key,section_key" },
    );

    revalidateContent();
    return { success: true, message: "Static content seeded to database." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to seed content.",
    };
  }
}

export async function getAdminServices() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getAdminPackages() {
  const { supabase } = await requireAdmin();
  const [{ data: packages }, { data: features }] = await Promise.all([
    supabase.from("packages").select("*").order("sort_order"),
    supabase.from("comparison_features").select("*").order("sort_order"),
  ]);
  return { packages: packages ?? [], features: features ?? [] };
}

export async function getAdminFaqs() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getAdminTestimonials() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAdminSiteSettings() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "main")
    .maybeSingle();
  return (data?.value as Record<string, unknown> | null) ?? siteConfig;
}

export async function getAdminPageSections() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("page_sections")
    .select("*")
    .eq("page_key", "home");
  return data ?? [];
}

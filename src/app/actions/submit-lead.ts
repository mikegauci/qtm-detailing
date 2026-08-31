"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  vehicle: z.string().optional(),
  message: z.string().optional(),
  website: z.string().optional(),
});

export type LeadFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function submitLead(
  _prevState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    vehicle: formData.get("vehicle") || undefined,
    message: formData.get("message") || undefined,
    website: formData.get("website") || undefined,
  };

  // Honeypot check
  if (raw.website) {
    return {
      success: true,
      message: "Thank you! We'll be in touch within 24 hours.",
    };
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return {
      success: false,
      message: "Too many requests. Please try again in a minute.",
    };
  }

  const parsed = leadSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { website: _, ...leadData } = parsed.data;

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("leads").insert({
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone ?? null,
      vehicle: leadData.vehicle ?? null,
      message: leadData.message ?? null,
      source: "website",
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return {
        success: false,
        message: "Something went wrong. Please try again or call us directly.",
      };
    }

    return {
      success: true,
      message: "Thank you! We'll be in touch within 24 hours.",
    };
  } catch (err) {
    console.error("Lead submission error:", err);
    return {
      success: false,
      message: "Something went wrong. Please try again or call us directly.",
    };
  }
}

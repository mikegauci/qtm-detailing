import { z } from "zod";

const supabaseEnvSchema = z.object({
  SUPABASE_URL: z.url("SUPABASE_URL must be a valid URL"),
  SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "SUPABASE_PUBLISHABLE_KEY is required"),
});

export type SupabaseEnv = {
  url: string;
  publishableKey: string;
};

export function getSupabaseEnv(): SupabaseEnv {
  const result = supabaseEnvSchema.safeParse(process.env);

  if (!result.success) {
    const messages = result.error.issues.map((issue) => issue.message).join("; ");
    throw new Error(`Missing or invalid environment variables: ${messages}`);
  }

  return {
    url: result.data.SUPABASE_URL,
    publishableKey: result.data.SUPABASE_PUBLISHABLE_KEY,
  };
}

export function getOptionalSiteUrl(): string | undefined {
  const url = process.env.SITE_URL?.trim();
  return url || undefined;
}

const DEFAULT_FROM_EMAIL = "QTM Detailing <hello@qtmdetailing.mt>";
const DEFAULT_NOTIFICATION_EMAIL = "hello@qtmdetailing.mt";

export type ResendConfig = {
  apiKey: string;
  fromEmail: string;
  notificationEmail: string;
};

export function getResendConfig(): ResendConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    fromEmail: process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM_EMAIL,
    notificationEmail:
      process.env.LEAD_NOTIFICATION_EMAIL?.trim() ||
      DEFAULT_NOTIFICATION_EMAIL,
  };
}

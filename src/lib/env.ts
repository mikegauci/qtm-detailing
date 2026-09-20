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

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

export function createPublicClient() {
  const { url, publishableKey } = getSupabaseEnv();

  return createSupabaseClient<Database>(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

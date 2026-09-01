import type { NextConfig } from "next";

function getSupabaseHostname(): string | undefined {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();

  if (!supabaseUrl) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "SUPABASE_URL is required for production builds. Set it in your deployment environment.",
      );
    }
    return undefined;
  }

  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    throw new Error("SUPABASE_URL must be a valid URL.");
  }
}

const supabaseHost = getSupabaseHostname();

const nextConfig: NextConfig = {
  images: supabaseHost
    ? {
        remotePatterns: [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/sign/**",
          },
        ],
      }
    : undefined,
};

export default nextConfig;

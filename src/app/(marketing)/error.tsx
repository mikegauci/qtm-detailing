"use client";

import { useEffect } from "react";
import { CTAButton } from "@/components/ui/section-heading";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="section-padding pt-32">
      <div className="container-narrow max-w-lg text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-3 text-muted-foreground">
          We could not load this page. Please try again.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-border-subtle px-6 py-2.5 text-sm font-medium transition-colors hover:border-brand-purple-400/50"
          >
            Try again
          </button>
          <CTAButton href="/">Back to home</CTAButton>
        </div>
      </div>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const GalleryHub = dynamic(
  () =>
    import("@/components/admin/gallery-hub").then((mod) => mod.GalleryHub),
  {
    loading: () => (
      <div className="rounded-xl border border-white/10 p-8 text-center text-sm text-white/60">
        Loading gallery…
      </div>
    ),
  },
);

export function GalleryHubLazy(props: ComponentProps<typeof GalleryHub>) {
  return <GalleryHub {...props} />;
}

"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const PageCopyEditor = dynamic(
  () =>
    import("@/components/admin/page-copy-editor").then(
      (mod) => mod.PageCopyEditor,
    ),
  {
    loading: () => (
      <div className="rounded-xl border border-white/10 p-8 text-center text-sm text-white/60">
        Loading page copy editor…
      </div>
    ),
  },
);

const SitePageCopyEditor = dynamic(
  () =>
    import("@/components/admin/site-page-copy-editor").then(
      (mod) => mod.SitePageCopyEditor,
    ),
  {
    loading: () => (
      <div className="rounded-xl border border-white/10 p-8 text-center text-sm text-white/60">
        Loading site page copy editor…
      </div>
    ),
  },
);

export function PageCopyEditorLazy(
  props: ComponentProps<typeof PageCopyEditor>,
) {
  return <PageCopyEditor {...props} />;
}

export function SitePageCopyEditorLazy(
  props: ComponentProps<typeof SitePageCopyEditor>,
) {
  return <SitePageCopyEditor {...props} />;
}

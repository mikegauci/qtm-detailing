"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const FaqsEditor = dynamic(
  () =>
    import("@/components/admin/faqs-editor").then((mod) => mod.FaqsEditor),
  {
    loading: () => (
      <div className="rounded-xl border border-white/10 p-8 text-center text-sm text-white/60">
        Loading FAQ editor…
      </div>
    ),
  },
);

export function FaqsEditorLazy(props: ComponentProps<typeof FaqsEditor>) {
  return <FaqsEditor {...props} />;
}

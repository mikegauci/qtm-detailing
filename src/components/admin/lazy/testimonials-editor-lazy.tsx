"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const TestimonialsEditor = dynamic(
  () =>
    import("@/components/admin/testimonials-editor").then(
      (mod) => mod.TestimonialsEditor,
    ),
  {
    loading: () => (
      <div className="rounded-xl border border-white/10 p-8 text-center text-sm text-white/60">
        Loading testimonials editor…
      </div>
    ),
  },
);

export function TestimonialsEditorLazy(
  props: ComponentProps<typeof TestimonialsEditor>,
) {
  return <TestimonialsEditor {...props} />;
}

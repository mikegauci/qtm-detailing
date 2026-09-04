"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const ServicesEditor = dynamic(
  () =>
    import("@/components/admin/services-editor").then(
      (mod) => mod.ServicesEditor,
    ),
  { loading: () => <EditorLoading label="services editor" /> },
);

export function ServicesEditorLazy(
  props: ComponentProps<typeof ServicesEditor>,
) {
  return <ServicesEditor {...props} />;
}

function EditorLoading({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-white/10 p-8 text-center text-sm text-white/60">
      Loading {label}…
    </div>
  );
}

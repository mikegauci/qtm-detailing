"use client";

import { createLazyComponent } from "@/lib/lazy/create-lazy-component";
import type { FaqsEditor } from "@/components/admin/faqs-editor";

export const FaqsEditorLazy = createLazyComponent<
  React.ComponentProps<typeof FaqsEditor>
>(
  () => import("@/components/admin/faqs-editor"),
  "FaqsEditor",
  "FAQ editor",
);

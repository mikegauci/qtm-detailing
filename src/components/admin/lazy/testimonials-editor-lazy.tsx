"use client";

import { createLazyComponent } from "@/lib/lazy/create-lazy-component";
import type { TestimonialsEditor } from "@/components/admin/testimonials-editor";

export const TestimonialsEditorLazy = createLazyComponent<
  React.ComponentProps<typeof TestimonialsEditor>
>(
  () => import("@/components/admin/testimonials-editor"),
  "TestimonialsEditor",
  "testimonials editor",
);

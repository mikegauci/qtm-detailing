"use client";

import { createLazyComponent } from "@/lib/lazy/create-lazy-component";
import type { PricingEditor } from "@/components/admin/pricing-editor";

export const PricingEditorLazy = createLazyComponent<
  React.ComponentProps<typeof PricingEditor>
>(
  () => import("@/components/admin/pricing-editor"),
  "PricingEditor",
  "pricing editor",
);

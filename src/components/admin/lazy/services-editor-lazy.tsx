"use client";

import { createLazyComponent } from "@/lib/lazy/create-lazy-component";
import type { ServicesEditor } from "@/components/admin/services-editor";

export const ServicesEditorLazy = createLazyComponent<
  React.ComponentProps<typeof ServicesEditor>
>(
  () => import("@/components/admin/services-editor"),
  "ServicesEditor",
  "services editor",
);

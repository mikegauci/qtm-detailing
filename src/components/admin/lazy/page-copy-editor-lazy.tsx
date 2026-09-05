"use client";

import { createLazyComponent } from "@/lib/lazy/create-lazy-component";
import type { PageCopyEditor } from "@/components/admin/page-copy-editor";

export const PageCopyEditorLazy = createLazyComponent<
  React.ComponentProps<typeof PageCopyEditor>
>(
  () => import("@/components/admin/page-copy-editor"),
  "PageCopyEditor",
  "page copy editor",
);

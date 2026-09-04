"use client";

import { createLazyComponent } from "@/lib/lazy/create-lazy-component";
import type { PageCopyEditor } from "@/components/admin/page-copy-editor";
import type { SitePageCopyEditor } from "@/components/admin/site-page-copy-editor";

export const PageCopyEditorLazy = createLazyComponent<
  React.ComponentProps<typeof PageCopyEditor>
>(
  () => import("@/components/admin/page-copy-editor"),
  "PageCopyEditor",
  "page copy editor",
);

export const SitePageCopyEditorLazy = createLazyComponent<
  React.ComponentProps<typeof SitePageCopyEditor>
>(
  () => import("@/components/admin/site-page-copy-editor"),
  "SitePageCopyEditor",
  "site page copy editor",
);

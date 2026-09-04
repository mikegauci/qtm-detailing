"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { upsertPageSection } from "@/app/actions/admin/cms";
import type { Json } from "@/lib/supabase/types";

export function usePageSectionSave(defaultPageKey?: string) {
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const save = (pageKey: string, sectionKey: string, content: unknown) => {
    const key = `${pageKey}:${sectionKey}`;
    setSavingKey(key);
    startTransition(async () => {
      const result = await upsertPageSection({
        page_key: pageKey,
        section_key: sectionKey,
        content: content as Json,
      });
      setSavingKey(null);
      if (result.success) toast.success("Changes saved.");
      else toast.error(result.message);
    });
  };

  const isSaving = (pageKey: string, sectionKey: string) =>
    isPending && savingKey === `${pageKey}:${sectionKey}`;

  const saveSection = (sectionKey: string, content: unknown) => {
    if (!defaultPageKey) {
      throw new Error("defaultPageKey is required for saveSection");
    }
    save(defaultPageKey, sectionKey, content);
  };

  const isSavingSection = (sectionKey: string) =>
    defaultPageKey ? isSaving(defaultPageKey, sectionKey) : false;

  return {
    save,
    isSaving,
    saveSection,
    isSavingSection,
    isPending,
  };
}

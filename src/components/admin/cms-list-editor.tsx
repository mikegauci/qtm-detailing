"use client";

import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type CmsListEditorProps = {
  listTitle: string;
  formTitle: string;
  onNew: () => void;
  newLabel?: string;
  list: ReactNode;
  form: ReactNode;
};

export function CmsListEditor({
  listTitle,
  formTitle,
  onNew,
  newLabel = "New",
  list,
  form,
}: CmsListEditorProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{listTitle}</h2>
          <Button size="sm" variant="outline" onClick={onNew}>
            <Plus className="mr-1 h-3 w-3" />
            {newLabel}
          </Button>
        </div>
        {list}
      </div>

      <div className="space-y-4 rounded-xl border border-white/10 p-5">
        <h2 className="text-lg font-semibold">{formTitle}</h2>
        {form}
      </div>
    </div>
  );
}

"use client";

import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type CmsFormActionsProps = {
  isPending: boolean;
  saveLabel: string;
  onDelete?: () => void;
  deleteLabel?: string;
};

export function CmsFormActions({
  isPending,
  saveLabel,
  onDelete,
  deleteLabel = "Delete",
}: CmsFormActionsProps) {
  return (
    <div className="flex gap-2">
      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          saveLabel
        )}
      </Button>
      {onDelete ? (
        <Button
          type="button"
          variant="outline"
          onClick={onDelete}
          disabled={isPending}
        >
          <Trash2 className="mr-1 h-4 w-4" />
          {deleteLabel}
        </Button>
      ) : null}
    </div>
  );
}

"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";

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
      <SubmitButton isPending={isPending} label={saveLabel} />
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

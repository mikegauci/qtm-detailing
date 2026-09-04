"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type EnhancePromptResult = {
  enhance: boolean;
  blankPlate: boolean;
};

type EnhancePromptDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  photoCount?: number;
  confirmLabel?: string;
  onConfirm: (result: EnhancePromptResult) => void;
};

export function EnhancePromptDialog({
  open,
  onOpenChange,
  title,
  photoCount = 1,
  confirmLabel = "Continue",
  onConfirm,
}: EnhancePromptDialogProps) {
  const [enhance, setEnhance] = useState(true);
  const [blankPlate, setBlankPlate] = useState(false);

  useEffect(() => {
    if (open) {
      setEnhance(true);
      setBlankPlate(false);
    }
  }, [open]);

  const photoLabel =
    photoCount === 1 ? "1 photo" : `${photoCount} photos`;
  const usesAi = enhance || blankPlate;

  function handleConfirm() {
    onConfirm({ enhance, blankPlate });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {photoCount > 0
              ? `Processing ${photoLabel}. Optionally apply AI processing before uploading.`
              : "Optionally apply AI processing before uploading."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={enhance}
              onChange={(e) => setEnhance(e.target.checked)}
            />
            Enhance with AI
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={blankPlate}
              onChange={(e) => setBlankPlate(e.target.checked)}
            />
            Blank the number plate
          </label>

          {usesAi ? (
            <div className="space-y-1 text-xs text-white/50">
              <p>AI processing may take up to a minute per photo.</p>
              <p>
                Each AI generation costs about $0.02 per image
                {photoCount > 1
                  ? ` (~$${(0.02 * photoCount).toFixed(2)} for ${photoCount} photos)`
                  : ""}
                .
              </p>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

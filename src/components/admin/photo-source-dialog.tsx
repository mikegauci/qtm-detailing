"use client";

import { Images, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PhotoSourceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onChooseDevice: () => void;
  onChooseDrive: () => void;
  disabled?: boolean;
};

export function PhotoSourceDialog({
  open,
  onOpenChange,
  title,
  description = "Upload a new image or browse Google Drive.",
  onChooseDevice,
  onChooseDrive,
  disabled = false,
}: PhotoSourceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-auto justify-start gap-3 py-4"
            disabled={disabled}
            onClick={onChooseDevice}
          >
            <Upload className="h-5 w-5 shrink-0" />
            <span className="text-left">
              <span className="block font-medium">Upload from device</span>
              <span className="block text-xs text-white/50">
                Choose a photo from your computer or phone
              </span>
            </span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-auto justify-start gap-3 py-4"
            disabled={disabled}
            onClick={onChooseDrive}
          >
            <Images className="h-5 w-5 shrink-0" />
            <span className="text-left">
              <span className="block font-medium">Browse Google Drive</span>
              <span className="block text-xs text-white/50">
                Pick a photo directly from your Drive folders
              </span>
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

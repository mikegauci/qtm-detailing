"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImageIcon, Images, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  removeVehiclePhoto,
  uploadVehiclePhoto,
} from "@/app/actions/admin/customers";
import { LinkedPhotoPickerDialog } from "@/components/admin/linked-photo-picker-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function VehiclePhotoField({
  vehicleId,
  customerId,
  photoUrl,
  label,
  onUpdated,
}: {
  vehicleId: string;
  customerId: string;
  photoUrl: string | null;
  label: string;
  onUpdated?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [previewError, setPreviewError] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(photoUrl);
  const [sourceDialogOpen, setSourceDialogOpen] = useState(false);
  const [linkedPickerOpen, setLinkedPickerOpen] = useState(false);

  useEffect(() => {
    setCurrentUrl(photoUrl);
    setPreviewError(false);
  }, [photoUrl]);

  function handleUpload(file: File) {
    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadVehiclePhoto(vehicleId, customerId, formData);
      if (result.success && result.url) {
        setPreviewError(false);
        setCurrentUrl(result.url);
        toast.success(result.message);
        onUpdated?.();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeVehiclePhoto(vehicleId, customerId);
      if (result.success) {
        setPreviewError(false);
        setCurrentUrl(null);
        toast.success(result.message);
        onUpdated?.();
      } else {
        toast.error(result.message);
      }
    });
  }

  function openSourceDialog() {
    setSourceDialogOpen(true);
  }

  function chooseDeviceUpload() {
    setSourceDialogOpen(false);
    inputRef.current?.click();
  }

  function chooseLinkedPhoto() {
    setSourceDialogOpen(false);
    setLinkedPickerOpen(true);
  }

  return (
    <>
      <div className="space-y-2">
        <div
          className={cn(
            "relative h-24 w-32 overflow-hidden rounded-lg border border-white/10 bg-white/[0.02]",
          )}
        >
          {currentUrl && !previewError ? (
            <>
              <Image
                src={currentUrl}
                alt={label}
                fill
                className="object-cover"
                sizes="128px"
                onError={() => setPreviewError(true)}
              />
              <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-black/80 to-transparent p-1.5 pt-6">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-7 px-2 text-xs"
                  disabled={isPending}
                  onClick={openSourceDialog}
                >
                  {isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Upload className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs"
                  disabled={isPending}
                  onClick={handleRemove}
                >
                  Remove
                </Button>
              </div>
            </>
          ) : (
            <button
              type="button"
              disabled={isPending}
              onClick={openSourceDialog}
              className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white/70 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-[10px]">Add photo</span>
                </>
              )}
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = "";
          }}
        />
      </div>

      <Dialog open={sourceDialogOpen} onOpenChange={setSourceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add vehicle photo</DialogTitle>
            <DialogDescription>
              Upload a new image or browse Google Drive.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-auto justify-start gap-3 py-4"
              disabled={isPending}
              onClick={chooseDeviceUpload}
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
              disabled={isPending}
              onClick={chooseLinkedPhoto}
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

      <LinkedPhotoPickerDialog
        open={linkedPickerOpen}
        onOpenChange={setLinkedPickerOpen}
        vehicleId={vehicleId}
        customerId={customerId}
        onSelected={(url) => {
          setPreviewError(false);
          setCurrentUrl(url);
          onUpdated?.();
        }}
      />
    </>
  );
}

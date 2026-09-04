"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  removeVehiclePhoto,
  setVehiclePhotoFromDrive,
  setVehiclePhotoFromLinked,
  uploadVehiclePhoto,
} from "@/app/actions/admin/customers";
import { LinkedPhotoPickerDialog } from "@/components/admin/linked-photo-picker-dialog";
import { PhotoSourceDialog } from "@/components/admin/photo-source-dialog";
import { Button } from "@/components/ui/button";
import { useImageLoadError } from "@/hooks/use-image-load-error";
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
  const { hasError: previewError, onError: onPreviewError, reset: resetPreviewError } =
    useImageLoadError();
  const [currentUrl, setCurrentUrl] = useState(photoUrl);
  const [sourceDialogOpen, setSourceDialogOpen] = useState(false);
  const [linkedPickerOpen, setLinkedPickerOpen] = useState(false);

  useEffect(() => {
    setCurrentUrl(photoUrl);
    resetPreviewError();
  }, [photoUrl, resetPreviewError]);

  function handleUpload(file: File) {
    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadVehiclePhoto(vehicleId, customerId, formData);
      if (result.success && result.url) {
        resetPreviewError();
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
        resetPreviewError();
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
                onError={onPreviewError}
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
                "Replace"
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

      <PhotoSourceDialog
        open={sourceDialogOpen}
        onOpenChange={setSourceDialogOpen}
        title="Add vehicle photo"
        onChooseDevice={chooseDeviceUpload}
        onChooseDrive={chooseLinkedPhoto}
        disabled={isPending}
      />

      <LinkedPhotoPickerDialog
        open={linkedPickerOpen}
        onOpenChange={setLinkedPickerOpen}
        onDriveSelect={async (driveFileIds) => {
          const result = await setVehiclePhotoFromDrive(
            vehicleId,
            customerId,
            driveFileIds[0],
          );
          if (result.success && result.url) {
            resetPreviewError();
            setCurrentUrl(result.url);
            onUpdated?.();
          }
          return result;
        }}
        onLinkedSelect={async (photoIds) => {
          const result = await setVehiclePhotoFromLinked(
            vehicleId,
            customerId,
            photoIds[0],
          );
          if (result.success && result.url) {
            resetPreviewError();
            setCurrentUrl(result.url);
            onUpdated?.();
          }
          return result;
        }}
      />
    </>
  );
}

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  removeVehiclePhoto,
  setVehiclePhotoFromDrive,
  setVehiclePhotoFromLinked,
  uploadVehiclePhoto,
} from "@/app/actions/admin/customers";
import { HiddenImageFileInput } from "@/components/admin/hidden-image-file-input";
import { ImageUploadPreview } from "@/components/admin/image-upload-preview";
import { PhotoSourceFieldDialogs } from "@/components/admin/photo-source-field-dialogs";
import { usePhotoSourcePicker } from "@/hooks/use-photo-source-picker";
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
  const {
    sourceDialogOpen,
    linkedPickerOpen,
    setSourceDialogOpen,
    setLinkedPickerOpen,
    openSourceDialog,
    chooseDeviceUpload,
    chooseLinkedPhoto,
  } = usePhotoSourcePicker();
  const [currentUrl, setCurrentUrl] = useState(photoUrl);

  useEffect(() => {
    setCurrentUrl(photoUrl);
  }, [photoUrl]);

  function handleUpload(file: File) {
    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadVehiclePhoto(vehicleId, customerId, formData);
      if (result.success && result.url) {
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
        setCurrentUrl(null);
        toast.success(result.message);
        onUpdated?.();
      } else {
        toast.error(result.message);
      }
    });
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  return (
    <>
      <div className="space-y-2">
        <div
          className={cn(
            "relative h-24 w-32 overflow-hidden rounded-lg border border-white/10 bg-white/[0.02]",
          )}
        >
          <ImageUploadPreview
            value={currentUrl}
            alt={label}
            isPending={isPending}
            size="compact"
            emptyLabel="Add photo"
            onReplace={openSourceDialog}
            onRemove={handleRemove}
          />
        </div>
        <HiddenImageFileInput
          inputRef={inputRef}
          onSelect={(files) => handleUpload(files[0])}
        />
      </div>

      <PhotoSourceFieldDialogs
        title="Add vehicle photo"
        disabled={isPending}
        sourceDialogOpen={sourceDialogOpen}
        linkedPickerOpen={linkedPickerOpen}
        setSourceDialogOpen={setSourceDialogOpen}
        setLinkedPickerOpen={setLinkedPickerOpen}
        chooseDeviceUpload={chooseDeviceUpload}
        chooseLinkedPhoto={chooseLinkedPhoto}
        openFilePicker={openFilePicker}
        onDriveSelect={async (driveFileIds) => {
          const result = await setVehiclePhotoFromDrive(
            vehicleId,
            customerId,
            driveFileIds[0],
          );
          if (result.success && result.url) {
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
            setCurrentUrl(result.url);
            onUpdated?.();
          }
          return result;
        }}
      />
    </>
  );
}

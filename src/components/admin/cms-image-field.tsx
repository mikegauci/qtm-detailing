"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import {
  uploadCmsAsset,
  uploadCmsAssetFromDrive,
  uploadCmsAssetFromLinked,
} from "@/app/actions/admin/cms";
import { HiddenImageFileInput } from "@/components/admin/hidden-image-file-input";
import { ImageUploadPreview } from "@/components/admin/image-upload-preview";
import { PhotoSourceFieldDialogs } from "@/components/admin/photo-source-field-dialogs";
import { Label } from "@/components/ui/label";
import { usePhotoSourcePicker } from "@/hooks/use-photo-source-picker";
import { cn } from "@/lib/utils";

type CmsImageFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: string;
  filename?: string;
  aspectRatio?: "video" | "square" | "auto";
  className?: string;
};

export function CmsImageField({
  label,
  value,
  onChange,
  folder,
  filename,
  aspectRatio = "video",
  className,
}: CmsImageFieldProps) {
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

  const applyUploadResult = (result: {
    success: boolean;
    message: string;
    url?: string;
  }) => {
    if (result.success && result.url) {
      onChange(result.url);
      toast.success("Image uploaded.");
    } else {
      toast.error(result.message);
    }
  };

  const handleUpload = (file: File) => {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", folder);
    if (filename) formData.set("filename", filename);

    startTransition(async () => {
      applyUploadResult(await uploadCmsAsset(formData));
    });
  };

  const openFilePicker = () => inputRef.current?.click();

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "video"
        ? "aspect-video"
        : "aspect-auto min-h-[140px]";

  return (
    <>
      <div className={cn("space-y-2", className)}>
        <Label>{label}</Label>
        <div
          className={cn(
            "relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.02]",
            aspectClass,
          )}
        >
          <ImageUploadPreview
            value={value || null}
            alt={label}
            isPending={isPending}
            aspectClass={aspectClass}
            emptySubtitle="Upload from device or browse Google Drive"
            onReplace={openSourceDialog}
            onRemove={() => onChange("")}
          />
        </div>
        <HiddenImageFileInput
          inputRef={inputRef}
          onSelect={(files) => handleUpload(files[0])}
        />
      </div>

      <PhotoSourceFieldDialogs
        title={`Add ${label.toLowerCase()}`}
        disabled={isPending}
        sourceDialogOpen={sourceDialogOpen}
        linkedPickerOpen={linkedPickerOpen}
        setSourceDialogOpen={setSourceDialogOpen}
        setLinkedPickerOpen={setLinkedPickerOpen}
        chooseDeviceUpload={chooseDeviceUpload}
        chooseLinkedPhoto={chooseLinkedPhoto}
        openFilePicker={openFilePicker}
        onDriveSelect={async (driveFileIds) => {
          const result = await uploadCmsAssetFromDrive(
            driveFileIds[0],
            folder,
            filename,
          );
          if (result.success && result.url) {
            onChange(result.url);
          }
          return result;
        }}
        onLinkedSelect={async (photoIds) => {
          const result = await uploadCmsAssetFromLinked(
            photoIds[0],
            folder,
            filename,
          );
          if (result.success && result.url) {
            onChange(result.url);
          }
          return result;
        }}
      />
    </>
  );
}

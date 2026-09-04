"use client";

import { useRef, useTransition } from "react";
import { ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  uploadCmsAsset,
  uploadCmsAssetFromDrive,
  uploadCmsAssetFromLinked,
} from "@/app/actions/admin/cms";
import { LinkedPhotoPickerDialog } from "@/components/admin/linked-photo-picker-dialog";
import { ImageUploadPreview } from "@/components/admin/image-upload-preview";
import { PhotoSourceDialog } from "@/components/admin/photo-source-dialog";
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
          {value ? (
            <ImageUploadPreview
              value={value}
              alt={label}
              isPending={isPending}
              aspectClass={aspectClass}
              onReplace={openSourceDialog}
              onRemove={() => onChange("")}
              emptyState={
                <button
                  type="button"
                  disabled={isPending}
                  onClick={openSourceDialog}
                  className="flex h-full min-h-[140px] w-full flex-col items-center justify-center gap-2 p-4 text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white/70 disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-sm">Click to add image</span>
                      <span className="text-xs text-white/40">
                        Upload from device or browse Google Drive
                      </span>
                    </>
                  )}
                </button>
              }
            />
          ) : (
            <button
              type="button"
              disabled={isPending}
              onClick={openSourceDialog}
              className="flex h-full min-h-[140px] w-full flex-col items-center justify-center gap-2 p-4 text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white/70 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-sm">Click to add image</span>
                  <span className="text-xs text-white/40">
                    Upload from device or browse Google Drive
                  </span>
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
        title={`Add ${label.toLowerCase()}`}
        onChooseDevice={() => chooseDeviceUpload(openFilePicker)}
        onChooseDrive={chooseLinkedPhoto}
        disabled={isPending}
      />

      <LinkedPhotoPickerDialog
        open={linkedPickerOpen}
        onOpenChange={setLinkedPickerOpen}
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

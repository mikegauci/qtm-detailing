"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  uploadCmsAsset,
  uploadCmsAssetFromDrive,
  uploadCmsAssetFromLinked,
} from "@/app/actions/admin/cms";
import { LinkedPhotoPickerDialog } from "@/components/admin/linked-photo-picker-dialog";
import { PhotoSourceDialog } from "@/components/admin/photo-source-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  const [previewError, setPreviewError] = useState(false);
  const [sourceDialogOpen, setSourceDialogOpen] = useState(false);
  const [linkedPickerOpen, setLinkedPickerOpen] = useState(false);

  const applyUploadResult = (result: {
    success: boolean;
    message: string;
    url?: string;
  }) => {
    if (result.success && result.url) {
      setPreviewError(false);
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

  const openSourceDialog = () => {
    setSourceDialogOpen(true);
  };

  const chooseDeviceUpload = () => {
    setSourceDialogOpen(false);
    inputRef.current?.click();
  };

  const chooseDrivePhoto = () => {
    setSourceDialogOpen(false);
    setLinkedPickerOpen(true);
  };

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
          {value && !previewError ? (
            <>
              <Image
                key={value}
                src={value}
                alt={label}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
                onError={() => setPreviewError(true)}
              />
              <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={isPending}
                  onClick={openSourceDialog}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Upload className="mr-1 h-3 w-3" />
                      Replace
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => {
                    setPreviewError(false);
                    onChange("");
                  }}
                >
                  <X className="mr-1 h-3 w-3" />
                  Remove
                </Button>
              </div>
            </>
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
        onChooseDevice={chooseDeviceUpload}
        onChooseDrive={chooseDrivePhoto}
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
            setPreviewError(false);
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
            setPreviewError(false);
            onChange(result.url);
          }
          return result;
        }}
      />
    </>
  );
}

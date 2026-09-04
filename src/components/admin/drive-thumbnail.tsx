"use client";

import { ImageIcon } from "lucide-react";
import { useImageLoadError } from "@/hooks/use-image-load-error";
import { cn } from "@/lib/utils";

type DriveThumbnailProps = {
  fileId: string;
  name: string;
  size?: "sm" | "lg";
};

export function DriveThumbnail({
  fileId,
  name,
  size = "lg",
}: DriveThumbnailProps) {
  const { hasError, onError } = useImageLoadError();

  if (hasError) {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center rounded-lg bg-white/10",
          size === "lg" ? "aspect-square" : "h-12 w-12",
        )}
      >
        <ImageIcon
          className={cn(
            "text-white/40",
            size === "lg" ? "h-8 w-8" : "h-5 w-5",
          )}
        />
      </div>
    );
  }

  return (
    <img
      src={`/api/google-drive/thumbnail/${fileId}`}
      alt={name}
      loading="lazy"
      className={cn(
        "rounded-lg object-cover bg-white/10",
        size === "lg" ? "aspect-square w-full" : "h-12 w-12 shrink-0",
      )}
      onError={onError}
    />
  );
}

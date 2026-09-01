"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryPhoto } from "@/types/content";
import { getGalleryPhotoLabel } from "@/lib/content/gallery-categories";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type GalleryLightboxProps = {
  photos: GalleryPhoto[];
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
};

export function GalleryLightbox({
  photos,
  index,
  open,
  onOpenChange,
  onIndexChange,
}: GalleryLightboxProps) {
  const photo = photos[index];
  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) {
      onIndexChange(index - 1);
    }
  }, [hasPrev, index, onIndexChange]);

  const goNext = useCallback(() => {
    if (hasNext) {
      onIndexChange(index + 1);
    }
  }, [hasNext, index, onIndexChange]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, goPrev, goNext]);

  if (!photo) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "fixed inset-0 z-50 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-black/95 p-0 shadow-none sm:max-w-none",
          "top-0 left-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "[&_[data-slot=dialog-close]]:top-4 [&_[data-slot=dialog-close]]:right-4 [&_[data-slot=dialog-close]]:text-white/80 [&_[data-slot=dialog-close]]:opacity-100 hover:[&_[data-slot=dialog-close]]:text-white",
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 px-4 pt-4 pb-2 sm:px-6">
          <div className="min-w-0 pr-10">
            <DialogTitle className="truncate text-base text-white sm:text-lg">
              {getGalleryPhotoLabel(photo)}
            </DialogTitle>
            <p className="text-sm text-white/60 capitalize">
              {photo.photoType}
              {photos.length > 1 && (
                <span className="text-white/40">
                  {" "}
                  · {index + 1} of {photos.length}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center px-14 py-2 sm:px-20">
          {hasPrev && (
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous photo"
              className="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-black/70 sm:left-4"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <div className="relative h-full w-full">
            <Image
              key={photo.id}
              src={photo.imageUrl}
              alt={getGalleryPhotoLabel(photo)}
              fill
              unoptimized
              priority
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {hasNext && (
            <button
              type="button"
              onClick={goNext}
              aria-label="Next photo"
              className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-black/70 sm:right-4"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

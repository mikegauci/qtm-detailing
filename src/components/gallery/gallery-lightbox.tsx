"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Columns2 } from "lucide-react";
import type { GalleryPhoto } from "@/types/content";
import { getGalleryPhotoLabel } from "@/lib/content/gallery-categories";
import {
  clampLightboxIndex,
  getProjectPhotoSets,
  type GalleryPhotoTypeFilter,
} from "@/lib/content/gallery-photo-utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type GalleryLightboxProps = {
  photos: GalleryPhoto[];
  comparisonPhotos?: GalleryPhoto[];
  photoTypeFilter?: GalleryPhotoTypeFilter;
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
};

type CompareSideProps = {
  label: string;
  photos: GalleryPhoto[];
  index: number;
  onIndexChange: (index: number) => void;
  badgeClassName: string;
  projectLabel: string;
  isActive: boolean;
  onActivate: () => void;
};

function CompareSide({
  label,
  photos,
  index,
  onIndexChange,
  badgeClassName,
  projectLabel,
  isActive,
  onActivate,
}: CompareSideProps) {
  const current = photos[index];

  if (!current) {
    return null;
  }

  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  return (
    <div
      className={cn(
        "relative min-h-[30vh] rounded-lg sm:min-h-0",
        isActive && "ring-2 ring-brand-purple-400/60",
      )}
      onMouseDown={onActivate}
    >
      {hasPrev && (
        <button
          type="button"
          onClick={() => onIndexChange(index - 1)}
          aria-label={`Previous ${label.toLowerCase()} photo`}
          className="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      <Image
        key={current.id}
        src={current.imageUrl}
        alt={`${projectLabel} ${label.toLowerCase()}`}
        fill
        unoptimized
        priority
        className="rounded-lg object-contain"
        sizes="(max-width: 640px) 100vw, 50vw"
      />

      {hasNext && (
        <button
          type="button"
          onClick={() => onIndexChange(index + 1)}
          aria-label={`Next ${label.toLowerCase()} photo`}
          className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      <span
        className={cn(
          "absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm",
          badgeClassName,
        )}
      >
        {label}
        {photos.length > 1 && (
          <span className="text-white/70">
            {" "}
            · {index + 1}/{photos.length}
          </span>
        )}
      </span>
    </div>
  );
}

export function GalleryLightbox({
  photos,
  comparisonPhotos = photos,
  photoTypeFilter = "all",
  index,
  open,
  onOpenChange,
  onIndexChange,
}: GalleryLightboxProps) {
  const [compareMode, setCompareMode] = useState(false);
  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(0);
  const [activePhotoType, setActivePhotoType] =
    useState<GalleryPhoto["photoType"]>("before");
  const [activeCompareSide, setActiveCompareSide] =
    useState<GalleryPhoto["photoType"]>("before");

  const safeIndex = clampLightboxIndex(index, photos.length);
  const photo = photos[safeIndex];
  const useGridNavigation = photoTypeFilter === "all";

  const { beforePhotos, afterPhotos } = useMemo(
    () =>
      photo
        ? getProjectPhotoSets(photo, comparisonPhotos)
        : { beforePhotos: [], afterPhotos: [] },
    [photo, comparisonPhotos],
  );

  const canCompare = beforePhotos.length > 0 && afterPhotos.length > 0;
  const selectedBefore = beforePhotos[beforeIndex];
  const selectedAfter = afterPhotos[afterIndex];
  const activeTypePhotos =
    activePhotoType === "before" ? beforePhotos : afterPhotos;
  const activeTypeIndex =
    activePhotoType === "before" ? beforeIndex : afterIndex;
  const singleViewPhoto =
    activePhotoType === "before"
      ? (selectedBefore ?? photo)
      : (selectedAfter ?? photo);

  const syncGridIndex = useCallback(
    (target: GalleryPhoto | undefined) => {
      if (!target) {
        return;
      }

      const targetIndex = photos.findIndex((item) => item.id === target.id);
      if (targetIndex >= 0) {
        onIndexChange(targetIndex);
      }
    },
    [photos, onIndexChange],
  );

  const syncSelectionFromPhoto = useCallback(
    (current: GalleryPhoto) => {
      const beforeMatch = beforePhotos.findIndex((item) => item.id === current.id);
      const afterMatch = afterPhotos.findIndex((item) => item.id === current.id);

      if (beforeMatch >= 0) {
        setBeforeIndex(beforeMatch);
      }

      if (afterMatch >= 0) {
        setAfterIndex(afterMatch);
      }

      setActivePhotoType(current.photoType);
    },
    [afterPhotos, beforePhotos],
  );

  const goPrevGrid = useCallback(() => {
    if (safeIndex > 0) {
      onIndexChange(safeIndex - 1);
    }
  }, [onIndexChange, safeIndex]);

  const goNextGrid = useCallback(() => {
    if (safeIndex < photos.length - 1) {
      onIndexChange(safeIndex + 1);
    }
  }, [onIndexChange, photos.length, safeIndex]);

  const goPrevType = useCallback(() => {
    if (activeTypeIndex <= 0) {
      return;
    }

    const nextIndex = activeTypeIndex - 1;
    const target = activeTypePhotos[nextIndex];

    if (activePhotoType === "before") {
      setBeforeIndex(nextIndex);
    } else {
      setAfterIndex(nextIndex);
    }

    syncGridIndex(target);
  }, [
    activePhotoType,
    activeTypeIndex,
    activeTypePhotos,
    syncGridIndex,
  ]);

  const goNextType = useCallback(() => {
    if (activeTypeIndex >= activeTypePhotos.length - 1) {
      return;
    }

    const nextIndex = activeTypeIndex + 1;
    const target = activeTypePhotos[nextIndex];

    if (activePhotoType === "before") {
      setBeforeIndex(nextIndex);
    } else {
      setAfterIndex(nextIndex);
    }

    syncGridIndex(target);
  }, [
    activePhotoType,
    activeTypeIndex,
    activeTypePhotos,
    syncGridIndex,
  ]);

  const goPrevSingle = useGridNavigation ? goPrevGrid : goPrevType;
  const goNextSingle = useGridNavigation ? goNextGrid : goNextType;
  const hasPrevSingle = useGridNavigation
    ? safeIndex > 0
    : activeTypeIndex > 0;
  const hasNextSingle = useGridNavigation
    ? safeIndex < photos.length - 1
    : activeTypeIndex < activeTypePhotos.length - 1;

  const jumpToPhotoType = useCallback(
    (photoType: GalleryPhoto["photoType"]) => {
      if (photoType === activePhotoType) {
        return;
      }

      const alignedIndex =
        activePhotoType === "before" ? beforeIndex : afterIndex;
      const targetPhotos =
        photoType === "before" ? beforePhotos : afterPhotos;

      if (targetPhotos.length === 0) {
        return;
      }

      const nextIndex = Math.min(alignedIndex, targetPhotos.length - 1);
      const target = targetPhotos[nextIndex];

      if (photoType === "before") {
        setBeforeIndex(nextIndex);
      } else {
        setAfterIndex(nextIndex);
      }

      setCompareMode(false);
      setActivePhotoType(photoType);
      syncGridIndex(target);
    },
    [
      activePhotoType,
      afterIndex,
      afterPhotos,
      beforeIndex,
      beforePhotos,
      syncGridIndex,
    ],
  );

  const goPrevCompareSide = useCallback(() => {
    if (activeCompareSide === "before") {
      if (beforeIndex > 0) {
        setBeforeIndex(beforeIndex - 1);
      }
      return;
    }

    if (afterIndex > 0) {
      setAfterIndex(afterIndex - 1);
    }
  }, [activeCompareSide, afterIndex, beforeIndex]);

  const goNextCompareSide = useCallback(() => {
    if (activeCompareSide === "before") {
      if (beforeIndex < beforePhotos.length - 1) {
        setBeforeIndex(beforeIndex + 1);
      }
      return;
    }

    if (afterIndex < afterPhotos.length - 1) {
      setAfterIndex(afterIndex + 1);
    }
  }, [
    activeCompareSide,
    afterIndex,
    afterPhotos.length,
    beforeIndex,
    beforePhotos.length,
  ]);

  useEffect(() => {
    if (!open) {
      setCompareMode(false);
    }
  }, [open]);

  useEffect(() => {
    if (safeIndex !== index && photos.length > 0) {
      onIndexChange(safeIndex);
    }
  }, [index, onIndexChange, photos.length, safeIndex]);

  useEffect(() => {
    if (!photo) {
      return;
    }

    syncSelectionFromPhoto(photo);
  }, [photo?.id, syncSelectionFromPhoto]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (compareMode) {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          goPrevCompareSide();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          goNextCompareSide();
        } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault();
          setActiveCompareSide((current) =>
            current === "before" ? "after" : "before",
          );
        }
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevSingle();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNextSingle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    open,
    compareMode,
    goPrevSingle,
    goNextSingle,
    goPrevCompareSide,
    goNextCompareSide,
  ]);

  if (!open || !photo || !singleViewPhoto) {
    return null;
  }

  const projectLabel = getGalleryPhotoLabel(photo);
  const singleViewCaption = useGridNavigation
    ? `${singleViewPhoto.photoType}${photos.length > 1 ? ` · ${safeIndex + 1} of ${photos.length}` : ""}`
    : `${activePhotoType}${activeTypePhotos.length > 1 ? ` · ${activeTypeIndex + 1} of ${activeTypePhotos.length}` : ""}`;

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
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 px-4 pt-4 pb-2 sm:px-6">
          <div className="min-w-0 pr-10">
            <DialogTitle className="truncate text-base text-white sm:text-lg">
              {projectLabel}
            </DialogTitle>
            <p className="text-sm text-white/60 capitalize">
              {compareMode
                ? "Use arrows on each side, or Up/Down to switch sides"
                : singleViewCaption}
            </p>
          </div>

          {canCompare && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-full border border-white/20 p-0.5">
                <button
                  type="button"
                  onClick={() => jumpToPhotoType("before")}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    !compareMode && activePhotoType === "before"
                      ? "bg-white text-black"
                      : "text-white/70 hover:text-white",
                  )}
                >
                  Before
                </button>
                <button
                  type="button"
                  onClick={() => jumpToPhotoType("after")}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    !compareMode && activePhotoType === "after"
                      ? "bg-brand-cyan-500 text-black"
                      : "text-white/70 hover:text-white",
                  )}
                >
                  After
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCompareMode((current) => !current);
                  setActiveCompareSide("before");
                }}
                aria-pressed={compareMode}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  compareMode
                    ? "border-brand-purple-400 bg-brand-purple-500/20 text-white"
                    : "border-white/20 text-white/70 hover:text-white",
                )}
              >
                <Columns2 className="h-3.5 w-3.5" />
                Compare
              </button>
            </div>
          )}
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 py-2 sm:px-6">
          {compareMode && selectedBefore && selectedAfter ? (
            <div className="grid h-full w-full max-w-6xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <CompareSide
                label="Before"
                photos={beforePhotos}
                index={beforeIndex}
                onIndexChange={setBeforeIndex}
                badgeClassName="bg-black/60 text-white"
                projectLabel={projectLabel}
                isActive={activeCompareSide === "before"}
                onActivate={() => setActiveCompareSide("before")}
              />
              <CompareSide
                label="After"
                photos={afterPhotos}
                index={afterIndex}
                onIndexChange={setAfterIndex}
                badgeClassName="bg-brand-cyan-600/90 text-white"
                projectLabel={projectLabel}
                isActive={activeCompareSide === "after"}
                onActivate={() => setActiveCompareSide("after")}
              />
            </div>
          ) : (
            <>
              {hasPrevSingle && (
                <button
                  type="button"
                  onClick={goPrevSingle}
                  aria-label="Previous photo"
                  className="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-black/70 sm:left-4"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              <div className="relative h-full w-full">
                <Image
                  key={singleViewPhoto.id}
                  src={singleViewPhoto.imageUrl}
                  alt={getGalleryPhotoLabel(singleViewPhoto)}
                  fill
                  unoptimized
                  priority
                  className="object-contain"
                  sizes="100vw"
                />
              </div>

              {hasNextSingle && (
                <button
                  type="button"
                  onClick={goNextSingle}
                  aria-label="Next photo"
                  className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-black/70 sm:right-4"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

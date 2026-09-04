"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImageLoadError } from "@/hooks/use-image-load-error";
import { cn } from "@/lib/utils";

type ImageUploadPreviewProps = {
  value?: string | null;
  alt: string;
  isPending?: boolean;
  aspectClass?: string;
  size?: "default" | "compact";
  emptyLabel?: string;
  emptySubtitle?: string;
  onReplace: () => void;
  onRemove: () => void;
  emptyState?: ReactNode;
};

function ImageUploadEmptyState({
  isPending,
  onReplace,
  aspectClass,
  size,
  emptyLabel,
  emptySubtitle,
}: {
  isPending: boolean;
  onReplace: () => void;
  aspectClass: string;
  size: "default" | "compact";
  emptyLabel: string;
  emptySubtitle?: string;
}) {
  const isCompact = size === "compact";

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={onReplace}
      className={cn(
        "flex h-full w-full flex-col items-center justify-center text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white/70 disabled:opacity-50",
        isCompact ? "gap-1 p-2" : "gap-2 p-4 min-h-[140px]",
        aspectClass,
      )}
    >
      {isPending ? (
        <Loader2 className={isCompact ? "h-5 w-5 animate-spin" : "h-8 w-8 animate-spin"} />
      ) : (
        <>
          <ImageIcon className={isCompact ? "h-5 w-5" : "h-8 w-8"} />
          <span className={isCompact ? "text-[10px]" : "text-sm"}>{emptyLabel}</span>
          {emptySubtitle ? (
            <span className="text-xs text-white/40">{emptySubtitle}</span>
          ) : null}
        </>
      )}
    </button>
  );
}

export function ImageUploadPreview({
  value,
  alt,
  isPending = false,
  aspectClass = "aspect-video",
  size = "default",
  emptyLabel = "Click to add image",
  emptySubtitle,
  onReplace,
  onRemove,
  emptyState,
}: ImageUploadPreviewProps) {
  const { hasError, onError, reset } = useImageLoadError();
  const isCompact = size === "compact";

  if (value && !hasError) {
    return (
      <>
        <Image
          key={value}
          src={value}
          alt={alt}
          fill
          className="object-cover"
          sizes={isCompact ? "128px" : "(max-width: 768px) 100vw, 400px"}
          onError={onError}
        />
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 flex bg-gradient-to-t from-black/80 to-transparent",
            isCompact ? "gap-1 p-1.5 pt-6" : "gap-2 p-3 pt-8",
          )}
        >
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={isPending}
            onClick={onReplace}
            className={isCompact ? "h-7 px-2 text-xs" : undefined}
          >
            {isPending ? (
              <Loader2 className={isCompact ? "h-3 w-3 animate-spin" : "h-4 w-4 animate-spin"} />
            ) : isCompact ? (
              "Replace"
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
              reset();
              onRemove();
            }}
            className={isCompact ? "h-7 px-2 text-xs" : undefined}
          >
            {isCompact ? (
              "Remove"
            ) : (
              <>
                <X className="mr-1 h-3 w-3" />
                Remove
              </>
            )}
          </Button>
        </div>
      </>
    );
  }

  return (
    emptyState ?? (
      <ImageUploadEmptyState
        isPending={isPending}
        onReplace={onReplace}
        aspectClass={aspectClass}
        size={size}
        emptyLabel={emptyLabel}
        emptySubtitle={emptySubtitle}
      />
    )
  );
}

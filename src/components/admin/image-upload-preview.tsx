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
  onReplace: () => void;
  onRemove: () => void;
  emptyState?: ReactNode;
};

export function ImageUploadPreview({
  value,
  alt,
  isPending = false,
  aspectClass = "aspect-video",
  onReplace,
  onRemove,
  emptyState,
}: ImageUploadPreviewProps) {
  const { hasError, onError, reset } = useImageLoadError();

  if (value && !hasError) {
    return (
      <>
        <Image
          key={value}
          src={value}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
          onError={onError}
        />
        <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={isPending}
            onClick={onReplace}
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
              reset();
              onRemove();
            }}
          >
            <X className="mr-1 h-3 w-3" />
            Remove
          </Button>
        </div>
      </>
    );
  }

  return (
    emptyState ?? (
      <button
        type="button"
        disabled={isPending}
        onClick={onReplace}
        className={cn(
          "flex h-full min-h-[140px] w-full flex-col items-center justify-center gap-2 p-4 text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white/70 disabled:opacity-50",
          aspectClass,
        )}
      >
        {isPending ? (
          <Loader2 className="h-8 w-8 animate-spin" />
        ) : (
          <>
            <ImageIcon className="h-8 w-8" />
            <span className="text-sm">Click to add image</span>
          </>
        )}
      </button>
    )
  );
}

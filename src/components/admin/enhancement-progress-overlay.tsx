"use client";

import { Check, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type EnhancementQueueStatus =
  | "queued"
  | "processing"
  | "complete"
  | "error";

type EnhancementProgressOverlayProps = {
  status: EnhancementQueueStatus;
  current: number;
  total: number;
  isEnhancing: boolean;
  errorMessage?: string;
};

export function EnhancementProgressOverlay({
  status,
  current,
  total,
  isEnhancing,
  errorMessage,
}: EnhancementProgressOverlayProps) {
  if (status === "queued") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/45">
        <p className="text-xs text-white/60">Waiting…</p>
      </div>
    );
  }

  if (status === "complete") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/90 text-white">
          <Check className="h-5 w-5" />
        </span>
      </div>
    );
  }

  const progressPercent =
    total > 0 ? Math.round(((current - 1) / total) * 100) : 0;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 px-4 text-center backdrop-blur-[2px]">
      {status === "processing" ? (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-brand-purple-400" />
          <p className="mt-3 text-sm font-medium text-white">
            {isEnhancing ? "Processing" : "Uploading"} {current} of {total}
          </p>
          <p className="mt-1 text-xs text-white/50">
            {isEnhancing
              ? "This may take up to a minute per photo"
              : "Optimizing image…"}
          </p>
          <div className="mt-4 h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-brand-purple-500 transition-all duration-500"
              style={{ width: `${Math.max(progressPercent, 8)}%` }}
            />
          </div>
        </>
      ) : null}

      {status === "error" ? (
        <>
          <p className="text-sm font-medium text-red-300">Failed</p>
          {errorMessage ? (
            <p className="mt-1 line-clamp-3 text-xs text-white/70">
              {errorMessage}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

type UploadQueueImageCardProps = {
  previewUrl: string | null;
  label: string;
  status: EnhancementQueueStatus;
  current: number;
  total: number;
  isEnhancing: boolean;
  errorMessage?: string;
  /** Fits inside bounded panels (e.g. gallery browser) without page scroll. */
  compact?: boolean;
};

export function UploadQueueImageCard({
  previewUrl,
  label,
  status,
  current,
  total,
  isEnhancing,
  errorMessage,
  compact = false,
}: UploadQueueImageCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-white/[0.02] p-3",
        compact && "mx-auto w-full max-w-md",
        status === "error"
          ? "border-red-500/40"
          : status === "processing"
            ? "border-brand-purple-500/50"
            : "border-white/10",
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="text-white/20">
          <Loader2
            className={cn(
              "h-4 w-4",
              status === "processing" && "animate-spin text-brand-purple-400",
            )}
          />
        </div>
        <span className="truncate text-sm text-white/60">{label}</span>
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-md border border-white/10 bg-white/5",
          compact
            ? "aspect-[4/3] max-h-[min(16rem,42vh)]"
            : "aspect-[16/10]",
        )}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={label}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-10 w-10 text-white/25" />
          </div>
        )}

        <EnhancementProgressOverlay
          status={status}
          current={current}
          total={total}
          isEnhancing={isEnhancing}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  );
}

type UploadQueuePanelProps = {
  queue: UploadQueueItem[];
  progress: { current: number; total: number };
  isAiProcessing: boolean;
  compact?: boolean;
  /** When true, hide queued items and only show active or failed photos. */
  activeOnly?: boolean;
};

export function UploadQueuePanel({
  queue,
  progress,
  isAiProcessing,
  compact = false,
  activeOnly = false,
}: UploadQueuePanelProps) {
  const visibleQueue = activeOnly
    ? (() => {
        const active = queue.filter(
          (item) => item.status === "processing" || item.status === "error",
        );
        if (active.length > 0) {
          return active;
        }
        const next = queue.find((item) => item.status === "queued");
        return next ? [next] : [];
      })()
    : queue;

  if (visibleQueue.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "space-y-3",
        compact && "max-h-[min(32rem,70vh)] overflow-y-auto pr-1",
      )}
    >
      <p className="text-sm text-white/70">
        {isAiProcessing ? "Processing" : "Publishing"}
        {progress.total > 0 ? ` ${progress.current}/${progress.total}` : ""}
        …
      </p>
      <div className="space-y-3">
        {visibleQueue.map((item, index) => (
          <UploadQueueImageCard
            key={item.id}
            previewUrl={item.previewUrl}
            label={item.label}
            status={item.status}
            current={progress.current || index + 1}
            total={progress.total || queue.length}
            isEnhancing={isAiProcessing}
            errorMessage={item.errorMessage}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

export type UploadQueueItem = {
  id: string;
  previewUrl: string | null;
  blobUrl?: string;
  status: EnhancementQueueStatus;
  errorMessage?: string;
  label: string;
};

export function buildGalleryPublishQueue(
  action:
    | { type: "single"; photoId: string }
    | { type: "bulk"; photoIds: string[] }
    | { type: "drive"; driveFileIds: string[] },
  photos: Array<{
    id: string;
    drive_file_id?: string | null;
    photo_url?: string | null;
  }>,
): UploadQueueItem[] {
  if (action.type === "single") {
    const photo = photos.find((entry) => entry.id === action.photoId);
    return [
      {
        id: action.photoId,
        previewUrl: getGalleryPreviewUrl(photo),
        status: "queued",
        label: "Photo 1",
      },
    ];
  }

  if (action.type === "bulk") {
    return action.photoIds.map((photoId, index) => {
      const photo = photos.find((entry) => entry.id === photoId);
      return {
        id: photoId,
        previewUrl: getGalleryPreviewUrl(photo),
        status: "queued",
        label: `Photo ${index + 1}`,
      };
    });
  }

  return action.driveFileIds.map((driveFileId, index) => ({
    id: driveFileId,
    previewUrl: `/api/google-drive/thumbnail/${driveFileId}`,
    status: "queued",
    label: `Photo ${index + 1}`,
  }));
}

function getGalleryPreviewUrl(
  photo?: {
    drive_file_id?: string | null;
    photo_url?: string | null;
  },
): string | null {
  if (photo?.drive_file_id) {
    return `/api/google-drive/thumbnail/${photo.drive_file_id}`;
  }

  if (photo?.photo_url) {
    return photo.photo_url;
  }

  return null;
}

export function buildUploadQueue(
  pending: {
    type: "device";
    files: File[];
  } | {
    type: "drive";
    driveFileIds: string[];
  } | {
    type: "linked";
    photoIds: string[];
  },
): UploadQueueItem[] {
  if (pending.type === "device") {
    return pending.files.map((file, index) => {
      const blobUrl = URL.createObjectURL(file);
      return {
        id: `device-${index}-${file.name}`,
        previewUrl: blobUrl,
        blobUrl,
        status: "queued",
        label: `Photo ${index + 1}`,
      };
    });
  }

  if (pending.type === "drive") {
    return pending.driveFileIds.map((driveFileId, index) => ({
      id: `drive-${driveFileId}`,
      previewUrl: `/api/google-drive/thumbnail/${driveFileId}`,
      status: "queued",
      label: `Photo ${index + 1}`,
    }));
  }

  return pending.photoIds.map((photoId, index) => ({
    id: `linked-${photoId}`,
    previewUrl: null,
    status: "queued",
    label: `Photo ${index + 1}`,
  }));
}

export function revokeUploadQueueBlobUrls(items: UploadQueueItem[]) {
  for (const item of items) {
    if (item.blobUrl) {
      URL.revokeObjectURL(item.blobUrl);
    }
  }
}

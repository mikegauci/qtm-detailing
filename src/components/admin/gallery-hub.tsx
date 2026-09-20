"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HardDrive,
  Images,
  Loader2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  getGalleryPhotos,
  linkDrivePhoto,
  publishPhoto,
  deletePhoto,
  updatePhotoMetadata,
} from "@/app/actions/admin/gallery";
import {
  EnhancePromptDialog,
  type EnhancePromptResult,
} from "@/components/admin/enhance-prompt-dialog";
import {
  UploadQueuePanel,
  buildGalleryPublishQueue,
  createQueueItemProcessor,
  type UploadQueueItem,
} from "@/components/admin/enhancement-progress-overlay";
import type { Tables } from "@/lib/supabase/types";
import { DriveConnectPrompt } from "@/components/admin/drive-connect-prompt";
import { GalleryPhotoMetadataFields } from "@/components/admin/gallery-photo-metadata-fields";
import { LinkedPhotosPanel } from "@/components/admin/linked-photos-panel";
import { LinkedDrivePhotoOverlay } from "@/components/admin/linked-drive-photo-overlay";
import { SelectionCheckBadge } from "@/components/admin/selection-check-badge";
import { ViewToggle } from "@/components/admin/view-toggle";
import { DriveBrowser } from "@/components/admin/drive-browser";
import { DriveThumbnail } from "@/components/admin/drive-thumbnail";
import { Button } from "@/components/ui/button";
import {
  buildLinkedPhotosByDriveId,
  isDriveFilePublished,
} from "@/lib/cms/linked-drive-photos";
import { getGalleryPhotoCategoryLabel } from "@/lib/content/gallery-categories";
import { cn } from "@/lib/utils";
import { useDriveBrowser } from "@/hooks/use-drive-browser";
import type { DriveFolder } from "@/types/drive";

function buildPublishSummary(
  published: number,
  skipped: number,
  failed: number,
  isEnhance: boolean,
): string | null {
  if (published === 0 && skipped === 0 && failed === 0) {
    return null;
  }

  if (published === 0 && skipped > 0 && failed === 0) {
    return "Selected photos are already published.";
  }

  const parts: string[] = [];
  if (published > 0) {
    const verb = isEnhance ? "Enhanced" : "Published";
    parts.push(
      published === 1 ? `${verb} 1 photo` : `${verb} ${published} photos`,
    );
  }
  if (skipped > 0) {
    parts.push(
      skipped === 1 ? "1 already published" : `${skipped} already published`,
    );
  }
  if (failed > 0) {
    parts.push(failed === 1 ? "1 failed" : `${failed} failed`);
  }

  return `${parts.join(", ")}.`;
}

type GalleryView = "drive" | "linked";

type PendingPublishAction =
  | { type: "single"; photoId: string }
  | { type: "bulk"; photoIds: string[] }
  | { type: "drive"; driveFileIds: string[] };

type GalleryHubProps = {
  initialPhotos: Tables<"gallery_photos">[];
  driveConnected: boolean;
  rootFolderName?: string;
  initialView?: GalleryView;
};

export function GalleryHub({
  initialPhotos,
  driveConnected,
  rootFolderName = "QTM Detailing",
  initialView = "drive",
}: GalleryHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [photos, setPhotos] = useState(initialPhotos);
  const [view, setView] = useState<GalleryView>(initialView);
  const {
    folders,
    images,
    folderStack,
    currentFolder,
    loadingDrive,
    connectionExpired,
    canGoBack,
    openFolder: openDriveFolder,
    goBack: goBackDrive,
    initialize: initializeDriveBrowser,
  } = useDriveBrowser({ rootFolderName });
  const showDriveConnectPrompt = !driveConnected || connectionExpired;
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(
    new Set(),
  );
  const [category, setCategory] = useState("exterior");
  const [photoType, setPhotoType] = useState<"before" | "after">("before");
  const [isPending, startTransition] = useTransition();
  const [enhanceDialogOpen, setEnhanceDialogOpen] = useState(false);
  const [enhanceDialogConfig, setEnhanceDialogConfig] = useState({
    title: "Publish to gallery",
    confirmLabel: "Publish",
    successMessage: "published" as "published" | "enhanced",
    defaultEnhance: false,
  });
  const [pendingPhotoCount, setPendingPhotoCount] = useState(1);
  const [publishQueue, setPublishQueue] = useState<UploadQueueItem[]>([]);
  const [publishProgress, setPublishProgress] = useState({ current: 0, total: 0 });
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const initializedRef = useRef(false);
  const pendingPublishRef = useRef<PendingPublishAction | null>(null);

  const selectedCount = selectedImageIds.size;
  const isPublishing = publishQueue.length > 0;
  const draftCount = photos.filter(
    (photo) => !photo.publish_to_gallery && photo.drive_file_id,
  ).length;

  const linkedPhotosByDriveId = useMemo(
    () => buildLinkedPhotosByDriveId(photos),
    [photos],
  );

  const publishableImages = useMemo(
    () =>
      images.filter(
        (image) => !isDriveFilePublished(linkedPhotosByDriveId, image.id),
      ),
    [images, linkedPhotosByDriveId],
  );

  useEffect(() => {
    const nextView = searchParams.get("view") === "linked" ? "linked" : "drive";
    setView(nextView);
  }, [searchParams]);

  const setGalleryView = (nextView: GalleryView) => {
    setView(nextView);
    router.replace(
      nextView === "linked" ? "/admin/gallery?view=linked" : "/admin/gallery",
      { scroll: false },
    );
  };

  const clearSelection = () => setSelectedImageIds(new Set());

  const selectAllImages = () => {
    setSelectedImageIds(new Set(publishableImages.map((image) => image.id)));
  };

  const toggleImageSelection = (imageId: string) => {
    if (isDriveFilePublished(linkedPhotosByDriveId, imageId)) {
      return;
    }

    setSelectedImageIds((current) => {
      const next = new Set(current);
      if (next.has(imageId)) {
        next.delete(imageId);
      } else {
        next.add(imageId);
      }
      return next;
    });
  };

  const openFolder = useCallback(
    async (folder: DriveFolder) => {
      clearSelection();
      await openDriveFolder(folder);
    },
    [openDriveFolder],
  );

  const goBack = async () => {
    clearSelection();
    await goBackDrive();
  };

  useEffect(() => {
    if (
      !driveConnected ||
      connectionExpired ||
      initializedRef.current ||
      view !== "drive"
    ) {
      return;
    }

    initializedRef.current = true;
    void initializeDriveBrowser();
  }, [
    connectionExpired,
    driveConnected,
    initializeDriveBrowser,
    view,
  ]);

  const refreshPhotos = () => {
    startTransition(async () => {
      const next = await getGalleryPhotos();
      setPhotos(next);
    });
  };

  const handlePublishSelected = () => {
    if (!currentFolder) {
      toast.error("Select a folder first.");
      return;
    }

    const publishableIds = Array.from(selectedImageIds).filter(
      (driveFileId) => !isDriveFilePublished(linkedPhotosByDriveId, driveFileId),
    );

    if (publishableIds.length === 0) {
      toast.error("Selected photos are already published.");
      return;
    }

    openEnhanceDialog({
      type: "drive",
      driveFileIds: publishableIds,
    });
  };

  const openEnhanceDialog = (
    action: PendingPublishAction,
    config?: {
      title: string;
      confirmLabel: string;
      successMessage: "published" | "enhanced";
      defaultEnhance?: boolean;
    },
  ) => {
    pendingPublishRef.current = action;
    setEnhanceDialogConfig({
      title: "Publish to gallery",
      confirmLabel: "Publish",
      successMessage: "published",
      defaultEnhance: false,
      ...config,
    });
    setPendingPhotoCount(
      action.type === "single"
        ? 1
        : action.type === "bulk"
          ? action.photoIds.length
          : action.driveFileIds.length,
    );
    setEnhanceDialogOpen(true);
  };

  const runPendingPublish = ({ enhance, blankPlate }: EnhancePromptResult) => {
    const action = pendingPublishRef.current;
    if (!action) return;

    pendingPublishRef.current = null;
    const processing = { enhance, blankPlate };
    setIsAiProcessing(enhance || blankPlate);

    const queue = buildGalleryPublishQueue(action, photos);
    setPublishQueue(queue);
    setPublishProgress({ current: 0, total: queue.length });

    startTransition(async () => {
      let successCount = 0;
      let publishedCount = 0;
      let skippedCount = 0;
      let failedCount = 0;

      const processItem = createQueueItemProcessor({
        queue,
        setQueue: setPublishQueue,
        setProgress: setPublishProgress,
        onSuccess:
          action.type === "drive"
            ? undefined
            : () => {
                successCount += 1;
              },
      });

      if (action.type === "single") {
        const item = queue[0];
        if (!item) return;
        if (
          !(await processItem(item, () =>
            publishPhoto(action.photoId, processing),
          ))
        ) {
          failedCount += 1;
        }
      } else if (action.type === "bulk") {
        for (const [index, photoId] of action.photoIds.entries()) {
          const item = queue[index];
          if (!item) {
            continue;
          }
          if (
            !(await processItem(item, () =>
              publishPhoto(photoId, processing),
            ))
          ) {
            failedCount += 1;
          }
        }
      } else {
        if (!currentFolder) {
          toast.error("No folder selected.");
          setPublishQueue([]);
          setIsAiProcessing(false);
          return;
        }

        for (const [index, driveFileId] of action.driveFileIds.entries()) {
          const item = queue[index];
          if (!item) {
            continue;
          }

          const processed = await processItem(item, async () => {
            const linkResult = await linkDrivePhoto({
              driveFileId,
              driveFolderId: currentFolder.id,
              driveFolderName: currentFolder.name,
              photoType,
              category,
            });

            if (!linkResult.success || !linkResult.photoId) {
              return linkResult;
            }

            if (linkResult.alreadyPublished) {
              skippedCount += 1;
              return { success: true, message: linkResult.message };
            }

            const publishResult = await publishPhoto(
              linkResult.photoId,
              processing,
            );

            if (publishResult.success) {
              publishedCount += 1;
              return publishResult;
            }

            if (!linkResult.alreadyLinked) {
              await deletePhoto(linkResult.photoId);
            }

            return publishResult;
          });

          if (!processed) {
            failedCount += 1;
          }
        }
      }

      setPublishQueue((current) => current.filter((entry) => entry.status === "error"));
      setPublishProgress({ current: 0, total: 0 });
      setIsAiProcessing(false);

      const isEnhance = enhanceDialogConfig.successMessage === "enhanced";
      const summary =
        action.type === "drive"
          ? buildPublishSummary(
              publishedCount,
              skippedCount,
              failedCount,
              isEnhance,
            )
          : buildPublishSummary(
              successCount,
              0,
              failedCount,
              isEnhance,
            );

      if (summary) {
        if (publishedCount > 0 || successCount > 0) {
          toast.success(summary);
        } else if (skippedCount > 0 && failedCount === 0) {
          toast.message(summary);
        }
      }

      if (publishedCount > 0 || successCount > 0 || skippedCount > 0) {
        refreshPhotos();
        if (action.type === "drive") {
          clearSelection();
        }
      }
    });
  };

  const handlePublishAllDrafts = (photoIds: string[]) => {
    if (photoIds.length === 0) {
      return;
    }

    openEnhanceDialog({ type: "bulk", photoIds });
  };

  const handlePublish = (photoId: string) => {
    openEnhanceDialog({ type: "single", photoId });
  };

  const handleEnhance = (photoId: string) => {
    openEnhanceDialog(
      { type: "single", photoId },
      {
        title: "Enhance photo",
        confirmLabel: "Enhance",
        successMessage: "enhanced",
        defaultEnhance: true,
      },
    );
  };

  const handleDelete = (photoId: string) => {
    if (!confirm("Delete this photo permanently?")) return;
    startTransition(async () => {
      const result = await deletePhoto(photoId);
      if (result.success) {
        toast.success(result.message);
        refreshPhotos();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleUpdate = (
    photoId: string,
    photoType: "before" | "after",
    category: string,
  ) => {
    startTransition(async () => {
      const result = await updatePhotoMetadata({
        photoId,
        photoType,
        category,
      });
      if (result.success) {
        toast.success(result.message);
        refreshPhotos();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <>
      <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ViewToggle
          value={view}
          onChange={setGalleryView}
          options={[
            {
              id: "drive" as const,
              label: "Import from Drive",
              icon: <HardDrive className="h-4 w-4" />,
            },
            {
              id: "linked" as const,
              label: "Linked Photos",
              icon: <Images className="h-4 w-4" />,
              badge: (
                <>
                  {photos.length > 0 && (
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">
                      {photos.length}
                    </span>
                  )}
                  {draftCount > 0 && (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
                      {draftCount} draft{draftCount === 1 ? "" : "s"}
                    </span>
                  )}
                </>
              ),
            },
          ]}
        />
      </div>

      {view === "drive" ? (
        <div className="min-w-0 space-y-4 rounded-xl border border-white/10 bg-surface-raised/40 p-4 sm:space-y-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Google Drive Browser</h2>
            {showDriveConnectPrompt && (
              <Button asChild size="sm">
                <a href="/api/google-drive/auth">
                  {connectionExpired ? "Reconnect Drive" : "Connect Drive"}
                </a>
              </Button>
            )}
          </div>

          {showDriveConnectPrompt ? (
            <DriveConnectPrompt
              showButton={false}
              message={
                connectionExpired
                  ? "Your Google Drive connection expired. Reconnect to browse and link photos."
                  : "Connect Google Drive in Settings to browse and link photos."
              }
              className="py-0 text-left"
            />
          ) : (
            <>
              {isPublishing ? (
                <UploadQueuePanel
                  queue={publishQueue}
                  progress={publishProgress}
                  isAiProcessing={isAiProcessing}
                  compact
                  activeOnly
                />
              ) : (
                <DriveBrowser
                  folders={folders}
                  images={images}
                  folderStack={folderStack}
                  currentFolder={currentFolder}
                  loadingDrive={loadingDrive}
                  canGoBack={canGoBack}
                  onOpenFolder={openFolder}
                  onGoBack={goBack}
                  imageGridClassName="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5"
                  toolbar={
                    currentFolder && images.length > 0 ? (
                      <div className="sticky top-0 z-10 -mx-1 mb-4 flex flex-col gap-2 rounded-b-xl border border-white/10 bg-surface-raised/95 px-3 py-2 backdrop-blur-sm sm:flex-row sm:items-center sm:gap-3 sm:px-4">
                        <GalleryPhotoMetadataFields
                          photoType={photoType}
                          category={category}
                          onPhotoTypeChange={setPhotoType}
                          onCategoryChange={setCategory}
                          compact
                          layout="inline"
                        />
                        <div className="flex items-center justify-between gap-2 sm:ml-auto">
                          <div className="flex min-w-0 items-center gap-2 text-sm">
                            {selectedCount > 0 ? (
                              <>
                                <span className="whitespace-nowrap font-medium text-white">
                                  {selectedCount} of {publishableImages.length}{" "}
                                  selected
                                </span>
                                <button
                                  type="button"
                                  onClick={clearSelection}
                                  className="whitespace-nowrap text-brand-purple-300 transition-colors hover:text-white"
                                >
                                  Clear
                                </button>
                              </>
                            ) : (
                              <span className="whitespace-nowrap text-white/50">
                                Select photos to publish
                              </span>
                            )}
                            {selectedCount < publishableImages.length && (
                              <button
                                type="button"
                                onClick={selectAllImages}
                                className="whitespace-nowrap text-brand-purple-300 transition-colors hover:text-white"
                              >
                                Select all
                              </button>
                            )}
                          </div>
                          <Button
                            size="sm"
                            className="shrink-0"
                            onClick={handlePublishSelected}
                            disabled={isPending || selectedCount === 0}
                          >
                            <Upload className="mr-1.5 h-4 w-4" />
                            {selectedCount === 1 ? "Publish" : "Publish All"}
                          </Button>
                        </div>
                      </div>
                    ) : undefined
                  }
                  renderImage={(image) => {
                    const isSelected = selectedImageIds.has(image.id);
                    const linkedPhoto = linkedPhotosByDriveId.get(image.id);
                    const isPublishedLink = linkedPhoto?.publish_to_gallery === true;
                    const linkedTypeLabel =
                      linkedPhoto?.photo_type === "after" ? "After" : "Before";
                    const linkedCategoryLabel = linkedPhoto
                      ? getGalleryPhotoCategoryLabel(linkedPhoto.category)
                      : null;
                    return (
                      <button
                        key={image.id}
                        type="button"
                        aria-pressed={isSelected}
                        disabled={isPublishedLink}
                        aria-label={
                          linkedPhoto && linkedCategoryLabel
                            ? `${image.name}, linked as ${linkedTypeLabel} ${linkedCategoryLabel}${isPublishedLink ? ", already published" : ""}`
                            : image.name
                        }
                        onClick={() => toggleImageSelection(image.id)}
                        className={cn(
                          "relative min-w-0 overflow-hidden rounded-xl border-2 transition-colors",
                          isPublishedLink && "cursor-default opacity-90",
                          isSelected
                            ? "border-brand-purple-400 ring-2 ring-brand-purple-400/30"
                            : linkedPhoto
                              ? "border-brand-cyan-400/40 hover:border-brand-cyan-400/60"
                              : "border-white/10 hover:border-white/25",
                          isPublishedLink &&
                            "hover:border-brand-cyan-400/40",
                        )}
                      >
                        <DriveThumbnail
                          fileId={image.id}
                          name={image.name}
                          size="lg"
                        />
                        {linkedPhoto && (
                          <LinkedDrivePhotoOverlay
                            photoType={linkedPhoto.photo_type}
                            category={linkedPhoto.category}
                            published={linkedPhoto.publish_to_gallery}
                          />
                        )}
                        {isSelected && <SelectionCheckBadge selected size="sm" />}
                      </button>
                    );
                  }}
                />
              )}
            </>
          )}
        </div>
      ) : (
        <div className="min-w-0 rounded-xl border border-white/10 bg-surface-raised/40 p-4 sm:p-6">
          {isPublishing ? (
            <UploadQueuePanel
              queue={publishQueue}
              progress={publishProgress}
              isAiProcessing={isAiProcessing}
              compact
              activeOnly
            />
          ) : (
            <LinkedPhotosPanel
              photos={photos}
              isPending={isPending}
              onPublish={handlePublish}
              onEnhance={handleEnhance}
              onDelete={handleDelete}
              onPublishAllDrafts={handlePublishAllDrafts}
              onUpdate={handleUpdate}
            />
          )}
        </div>
      )}
      </div>

      <EnhancePromptDialog
        open={enhanceDialogOpen}
        onOpenChange={setEnhanceDialogOpen}
        title={enhanceDialogConfig.title}
        photoCount={pendingPhotoCount}
        confirmLabel={enhanceDialogConfig.confirmLabel}
        defaultEnhance={enhanceDialogConfig.defaultEnhance}
        onConfirm={runPendingPublish}
      />
    </>
  );
}

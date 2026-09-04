"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  ChevronLeft,
  Folder,
  HardDrive,
  ImageIcon,
  Images,
  Loader2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  findDriveRootFolder,
  getGalleryPhotos,
  linkDrivePhoto,
  listDriveFolders,
  listDriveImages,
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
  type UploadQueueItem,
} from "@/components/admin/enhancement-progress-overlay";
import type { Tables } from "@/lib/supabase/types";
import { galleryPhotoCategoryOptions } from "@/lib/content/gallery-categories";
import { LinkedPhotosPanel } from "@/components/admin/linked-photos-panel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type DriveFolder = { id: string; name: string };
type DriveImage = {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
};
type GalleryView = "drive" | "linked";

type PendingPublishAction =
  | { type: "single"; photoId: string }
  | { type: "bulk"; photoIds: string[] }
  | { type: "drive"; driveFileIds: string[] };

function DriveThumbnail({
  fileId,
  name,
  size = "sm",
}: {
  fileId: string;
  name: string;
  size?: "sm" | "lg";
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
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
      onError={() => setFailed(true)}
    />
  );
}

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
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [images, setImages] = useState<DriveImage[]>([]);
  const [folderStack, setFolderStack] = useState<DriveFolder[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(
    new Set(),
  );
  const [category, setCategory] = useState("exterior");
  const [photoType, setPhotoType] = useState<"before" | "after">("before");
  const [isPending, startTransition] = useTransition();
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [enhanceDialogOpen, setEnhanceDialogOpen] = useState(false);
  const [enhanceDialogConfig, setEnhanceDialogConfig] = useState({
    title: "Publish to gallery",
    confirmLabel: "Publish",
    successMessage: "published" as "published" | "enhanced",
  });
  const [pendingPhotoCount, setPendingPhotoCount] = useState(1);
  const [publishQueue, setPublishQueue] = useState<UploadQueueItem[]>([]);
  const [publishProgress, setPublishProgress] = useState({ current: 0, total: 0 });
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const initializedRef = useRef(false);
  const pendingPublishRef = useRef<PendingPublishAction | null>(null);

  const currentFolder = folderStack[folderStack.length - 1];
  const selectedCount = selectedImageIds.size;
  const isPublishing = publishQueue.length > 0;
  const draftCount = photos.filter(
    (photo) => !photo.publish_to_gallery && photo.drive_file_id,
  ).length;

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

  const toggleImageSelection = (imageId: string) => {
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

  const loadFolderContents = useCallback(async (stack: DriveFolder[]) => {
    setLoadingDrive(true);
    try {
      const folder = stack[stack.length - 1];
      const parentId = folder?.id;

      const [childFolders, folderImages] = await Promise.all([
        listDriveFolders(parentId),
        parentId ? listDriveImages(parentId) : Promise.resolve([]),
      ]);

      setFolders(childFolders);
      setImages(folderImages);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load folder");
    } finally {
      setLoadingDrive(false);
    }
  }, []);

  const openFolder = useCallback(
    async (folder: DriveFolder, stack?: DriveFolder[]) => {
      const nextStack = stack ?? [...folderStack, folder];
      setFolderStack(nextStack);
      clearSelection();
      await loadFolderContents(nextStack);
    },
    [folderStack, loadFolderContents],
  );

  const goBack = async () => {
    if (folderStack.length <= 1) return;
    const nextStack = folderStack.slice(0, -1);
    setFolderStack(nextStack);
    clearSelection();
    await loadFolderContents(nextStack);
  };

  const canGoBack = folderStack.length > 1;

  useEffect(() => {
    if (!driveConnected || initializedRef.current || view !== "drive") return;

    initializedRef.current = true;

    void (async () => {
      setLoadingDrive(true);
      try {
        const rootFolder = await findDriveRootFolder();
        if (rootFolder) {
          setFolderStack([rootFolder]);
          const [childFolders, folderImages] = await Promise.all([
            listDriveFolders(rootFolder.id),
            listDriveImages(rootFolder.id),
          ]);
          setFolders(childFolders);
          setImages(folderImages);
        } else {
          const rootFolders = await listDriveFolders();
          setFolders(rootFolders);
          setImages([]);
          toast.message(`"${rootFolderName}" folder not found — showing Drive root.`);
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to load Google Drive",
        );
      } finally {
        setLoadingDrive(false);
      }
    })();
  }, [driveConnected, rootFolderName, view]);

  const refreshPhotos = () => {
    startTransition(async () => {
      const next = await getGalleryPhotos();
      setPhotos(next);
    });
  };

  const handleLink = () => {
    if (selectedCount !== 1 || !currentFolder) {
      toast.error("Select one image to link as draft.");
      return;
    }

    const driveFileId = Array.from(selectedImageIds)[0];

    startTransition(async () => {
      const result = await linkDrivePhoto({
        driveFileId,
        driveFolderId: currentFolder.id,
        driveFolderName: currentFolder.name,
        photoType,
        category,
      });
      if (result.success) {
        toast.success(result.message);
        clearSelection();
        refreshPhotos();
      } else {
        toast.error(result.message);
      }
    });
  };

  const openEnhanceDialog = (
    action: PendingPublishAction,
    config?: {
      title: string;
      confirmLabel: string;
      successMessage: "published" | "enhanced";
    },
  ) => {
    pendingPublishRef.current = action;
    setEnhanceDialogConfig(
      config ?? {
        title: "Publish to gallery",
        confirmLabel: "Publish",
        successMessage: "published",
      },
    );
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

      const processItem = async (
        item: UploadQueueItem,
        publish: () => Promise<{ success: boolean; message: string }>,
      ) => {
        const itemIndex = queue.findIndex((entry) => entry.id === item.id);
        setPublishProgress({ current: itemIndex + 1, total: queue.length });
        setPublishQueue((current) =>
          current.map((entry) =>
            entry.id === item.id
              ? { ...entry, status: "processing" }
              : entry.status === "error"
                ? entry
                : { ...entry, status: "queued" },
          ),
        );

        const result = await publish();

        if (result.success) {
          successCount += 1;
          setPublishQueue((current) =>
            current.filter((entry) => entry.id !== item.id),
          );
        } else {
          setPublishQueue((current) =>
            current.map((entry) =>
              entry.id === item.id
                ? {
                    ...entry,
                    status: "error",
                    errorMessage: result.message,
                  }
                : entry,
            ),
          );
          toast.error(result.message);
        }
      };

      if (action.type === "single") {
        const item = queue[0];
        if (!item) return;
        await processItem(item, () =>
          publishPhoto(action.photoId, processing),
        );
      } else if (action.type === "bulk") {
        for (const [index, photoId] of action.photoIds.entries()) {
          await processItem(queue[index], () =>
            publishPhoto(photoId, processing),
          );
        }
      } else {
        if (!currentFolder) {
          toast.error("No folder selected.");
          setPublishQueue([]);
          setIsAiProcessing(false);
          return;
        }

        for (const [index, driveFileId] of action.driveFileIds.entries()) {
          await processItem(queue[index], async () => {
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

            const publishResult = await publishPhoto(
              linkResult.photoId,
              processing,
            );

            if (!publishResult.success) {
              await deletePhoto(linkResult.photoId);
            }

            return publishResult;
          });
        }
      }

      setPublishQueue((current) => current.filter((entry) => entry.status === "error"));
      setPublishProgress({ current: 0, total: 0 });
      setIsAiProcessing(false);

      if (successCount > 0) {
        const isEnhance = enhanceDialogConfig.successMessage === "enhanced";
        toast.success(
          isEnhance
            ? successCount === 1
              ? "Photo enhanced."
              : `Enhanced ${successCount} photos.`
            : successCount === 1
              ? "Photo published to gallery."
              : `Published ${successCount} photos to gallery.`,
        );
        refreshPhotos();
        if (action.type === "drive") {
          clearSelection();
          setGalleryView("linked");
        }
      }
    });
  };

  const handlePublishAllSelected = () => {
    if (selectedCount < 2 || !currentFolder) {
      return;
    }

    openEnhanceDialog({
      type: "drive",
      driveFileIds: Array.from(selectedImageIds),
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
        <div className="inline-flex w-full rounded-xl border border-white/10 bg-black/20 p-1 sm:w-auto">
          <button
            type="button"
            onClick={() => setGalleryView("drive")}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none",
              view === "drive"
                ? "bg-brand-purple-600 text-white"
                : "text-white/70 hover:text-white",
            )}
          >
            <HardDrive className="h-4 w-4" />
            Import from Drive
          </button>
          <button
            type="button"
            onClick={() => setGalleryView("linked")}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none",
              view === "linked"
                ? "bg-brand-purple-600 text-white"
                : "text-white/70 hover:text-white",
            )}
          >
            <Images className="h-4 w-4" />
            Linked Photos
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
          </button>
        </div>
      </div>

      {view === "drive" ? (
        <div className="min-w-0 space-y-4 rounded-xl border border-white/10 bg-surface-raised/40 p-4 sm:space-y-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Google Drive Browser</h2>
            {!driveConnected && (
              <Button asChild size="sm">
                <a href="/api/google-drive/auth">Connect Drive</a>
              </Button>
            )}
          </div>

          {!driveConnected ? (
            <p className="text-sm text-white/60">
              Connect Google Drive in Settings to browse and link photos.
            </p>
          ) : (
            <>
              {canGoBack && !isPublishing && (
                <div className="mb-4">
                  <Button variant="outline" size="sm" onClick={goBack}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back
                  </Button>
                </div>
              )}

              {folderStack.length > 0 && !isPublishing && (
                <p className="mb-4 truncate text-sm text-white/60">
                  {folderStack.map((folder) => folder.name).join(" / ")}
                </p>
              )}

              {isPublishing ? (
                <UploadQueuePanel
                  queue={publishQueue}
                  progress={publishProgress}
                  isAiProcessing={isAiProcessing}
                  compact
                  activeOnly
                />
              ) : loadingDrive ? (
                <div className="flex items-center gap-2 py-6 text-sm text-white/60">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                <div className="max-h-[min(32rem,70vh)] space-y-4 overflow-y-auto pr-1">
                  {folders.map((folder) => (
                    <button
                      key={folder.id}
                      type="button"
                      onClick={() => openFolder(folder)}
                      className="flex min-h-12 w-full items-center gap-3 rounded-lg border border-white/10 px-4 py-3 text-left text-sm transition-colors hover:bg-white/5"
                    >
                      <Folder className="h-5 w-5 shrink-0 text-brand-cyan-400" />
                      <span className="truncate">{folder.name}</span>
                    </button>
                  ))}
                  {currentFolder && images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
                      {images.map((image) => {
                        const isSelected = selectedImageIds.has(image.id);
                        return (
                          <button
                            key={image.id}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => toggleImageSelection(image.id)}
                            className={cn(
                              "relative min-w-0 overflow-hidden rounded-xl border-2 transition-colors",
                              isSelected
                                ? "border-brand-purple-400 ring-2 ring-brand-purple-400/30"
                                : "border-white/10 hover:border-white/25",
                            )}
                          >
                            <DriveThumbnail
                              fileId={image.id}
                              name={image.name}
                              size="lg"
                            />
                            {isSelected && (
                              <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-purple-500 text-white sm:top-2 sm:right-2 sm:h-6 sm:w-6">
                                <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {folders.length === 0 && images.length === 0 && (
                    <p className="py-6 text-center text-sm text-white/50">
                      This folder is empty.
                    </p>
                  )}
                </div>
              )}

              {selectedCount > 0 && currentFolder && !isPublishing && (
                <div className="space-y-4 border-t border-white/10 pt-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-white/70">
                      {selectedCount} photo{selectedCount === 1 ? "" : "s"}{" "}
                      selected
                    </p>
                    {selectedCount > 1 && (
                      <Button
                        className="w-full sm:w-auto"
                        onClick={handlePublishAllSelected}
                        disabled={isPending}
                      >
                        <Upload className="mr-1 h-4 w-4" />
                        Publish All
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={photoType}
                        onValueChange={(v) =>
                          setPhotoType(v as "before" | "after")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="before">Before</SelectItem>
                          <SelectItem value="after">After</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {galleryPhotoCategoryOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {selectedCount === 1 && (
                    <Button
                      className="w-full sm:w-auto"
                      onClick={handleLink}
                      disabled={isPending}
                    >
                      Link Photo
                    </Button>
                  )}
                </div>
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
        onConfirm={runPendingPublish}
      />
    </>
  );
}

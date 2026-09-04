"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ChevronLeft,
  Folder,
  HardDrive,
  ImageIcon,
  Images,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  findDriveRootFolder,
  listDriveFolders,
  listDriveImages,
} from "@/app/actions/admin/gallery";
import {
  getDrivePickerState,
  getLinkedPhotosForPicker,
  setVehiclePhotoFromDrive,
  setVehiclePhotoFromLinked,
} from "@/app/actions/admin/customers";
import type { Tables } from "@/lib/supabase/types";
import { parseCarName } from "@/lib/content/parse-car-name";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type DriveFolder = { id: string; name: string };
type DriveImage = { id: string; name: string };
type PickerView = "drive" | "linked";

function DriveThumbnail({
  fileId,
  name,
}: {
  fileId: string;
  name: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-white/10">
        <ImageIcon className="h-8 w-8 text-white/40" />
      </div>
    );
  }

  return (
    <img
      src={`/api/google-drive/thumbnail/${fileId}`}
      alt={name}
      loading="lazy"
      className="aspect-square w-full object-cover bg-white/10"
      onError={() => setFailed(true)}
    />
  );
}

function LinkedPhotoOption({
  photo,
  disabled,
  onSelect,
}: {
  photo: Tables<"gallery_photos">;
  disabled: boolean;
  onSelect: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const label = photo.drive_folder_name
    ? parseCarName(photo.drive_folder_name)
    : "Linked photo";
  const src =
    photo.publish_to_gallery && photo.photo_url
      ? photo.photo_url
      : photo.drive_file_id
        ? `/api/google-drive/thumbnail/${photo.drive_file_id}`
        : null;

  return (
    <button
      type="button"
      disabled={disabled || !src}
      onClick={onSelect}
      className="group overflow-hidden rounded-lg border border-white/10 text-left transition-colors hover:border-brand-purple-500/50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {src && !failed ? (
        <img
          src={src}
          alt={label}
          className="aspect-square w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-white/10">
          <ImageIcon className="h-8 w-8 text-white/40" />
        </div>
      )}
      <div className="space-y-0.5 p-2">
        <p className="truncate text-xs font-medium text-white">{label}</p>
        <p className="text-[10px] uppercase tracking-wide text-white/40">
          {photo.photo_type}
        </p>
      </div>
    </button>
  );
}

export function LinkedPhotoPickerDialog({
  open,
  onOpenChange,
  vehicleId,
  customerId,
  onSelected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId: string;
  customerId: string;
  onSelected?: (url: string) => void;
}) {
  const [view, setView] = useState<PickerView>("drive");
  const [driveConnected, setDriveConnected] = useState<boolean | null>(null);
  const [photos, setPhotos] = useState<Tables<"gallery_photos">[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [images, setImages] = useState<DriveImage[]>([]);
  const [folderStack, setFolderStack] = useState<DriveFolder[]>([]);
  const [loadingDrive, setLoadingDrive] = useState(false);
  const driveInitializedRef = useRef(false);

  const currentFolder = folderStack[folderStack.length - 1];
  const canGoBack = folderStack.length > 1;

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
      await loadFolderContents(nextStack);
    },
    [folderStack, loadFolderContents],
  );

  const goBack = async () => {
    if (folderStack.length <= 1) return;
    const nextStack = folderStack.slice(0, -1);
    setFolderStack(nextStack);
    await loadFolderContents(nextStack);
  };

  const initDriveBrowser = useCallback(async () => {
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
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load Google Drive",
      );
    } finally {
      setLoadingDrive(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      driveInitializedRef.current = false;
      setSearch("");
      setView("drive");
      return;
    }

    setIsLoading(true);
    startTransition(async () => {
      const [driveState, linkedResult] = await Promise.all([
        getDrivePickerState(),
        getLinkedPhotosForPicker(),
      ]);
      setDriveConnected(driveState.connected);
      setIsLoading(false);

      if (linkedResult.success) {
        setPhotos(linkedResult.photos);
      } else {
        toast.error(linkedResult.message ?? "Failed to load linked photos.");
      }
    });
  }, [open]);

  useEffect(() => {
    if (
      !open ||
      view !== "drive" ||
      !driveConnected ||
      driveInitializedRef.current
    ) {
      return;
    }

    driveInitializedRef.current = true;
    void initDriveBrowser();
  }, [open, view, driveConnected, initDriveBrowser]);

  const filteredPhotos = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return photos;

    return photos.filter((photo) => {
      const label = photo.drive_folder_name
        ? parseCarName(photo.drive_folder_name)
        : "";
      return (
        label.toLowerCase().includes(query) ||
        photo.photo_type.toLowerCase().includes(query) ||
        (photo.category ?? "").toLowerCase().includes(query)
      );
    });
  }, [photos, search]);

  function handleLinkedSelect(photoId: string) {
    startTransition(async () => {
      const result = await setVehiclePhotoFromLinked(
        vehicleId,
        customerId,
        photoId,
      );
      if (result.success && result.url) {
        toast.success(result.message);
        onSelected?.(result.url);
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleDriveSelect(driveFileId: string) {
    startTransition(async () => {
      const result = await setVehiclePhotoFromDrive(
        vehicleId,
        customerId,
        driveFileId,
      );
      if (result.success && result.url) {
        toast.success(result.message);
        onSelected?.(result.url);
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose from Google Drive</DialogTitle>
          <DialogDescription>
            Browse your Drive folders or pick from previously linked photos.
          </DialogDescription>
        </DialogHeader>

        <div className="inline-flex w-full rounded-xl border border-white/10 bg-black/20 p-1">
          <button
            type="button"
            onClick={() => setView("drive")}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              view === "drive"
                ? "bg-brand-purple-600 text-white"
                : "text-white/70 hover:text-white",
            )}
          >
            <HardDrive className="h-4 w-4" />
            Google Drive
          </button>
          <button
            type="button"
            onClick={() => setView("linked")}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              view === "linked"
                ? "bg-brand-purple-600 text-white"
                : "text-white/70 hover:text-white",
            )}
          >
            <Images className="h-4 w-4" />
            Linked library
            {photos.length > 0 && (
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">
                {photos.length}
              </span>
            )}
          </button>
        </div>

        {view === "linked" && (
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by vehicle or type..."
              className="pl-9"
            />
          </div>
        )}

        <div
          className={cn(
            "max-h-[50vh] overflow-y-auto pr-1",
            (isLoading || loadingDrive) && "opacity-60",
          )}
        >
          {view === "drive" ? (
            driveConnected === false ? (
              <div className="space-y-4 py-8 text-center">
                <p className="text-sm text-white/60">
                  Connect Google Drive to browse your photo folders.
                </p>
                <Button asChild size="sm">
                  <a href="/api/google-drive/auth">Connect Google Drive</a>
                </Button>
              </div>
            ) : loadingDrive || driveConnected === null ? (
              <div className="flex items-center justify-center py-16 text-white/50">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {canGoBack && (
                  <Button variant="outline" size="sm" onClick={goBack}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back
                  </Button>
                )}

                {folderStack.length > 0 && (
                  <p className="truncate text-sm text-white/60">
                    {folderStack.map((folder) => folder.name).join(" / ")}
                  </p>
                )}

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
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {images.map((image) => (
                      <button
                        key={image.id}
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDriveSelect(image.id)}
                        className="overflow-hidden rounded-lg border border-white/10 transition-colors hover:border-brand-purple-500/50 disabled:opacity-50"
                      >
                        <DriveThumbnail fileId={image.id} name={image.name} />
                        <p className="truncate p-2 text-xs text-white/70">
                          {image.name}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {folders.length === 0 && images.length === 0 && (
                  <p className="py-16 text-center text-sm text-white/50">
                    This folder is empty.
                  </p>
                )}
              </div>
            )
          ) : isLoading ? (
            <div className="flex items-center justify-center py-16 text-white/50">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredPhotos.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filteredPhotos.map((photo) => (
                <LinkedPhotoOption
                  key={photo.id}
                  photo={photo}
                  disabled={isPending}
                  onSelect={() => handleLinkedSelect(photo.id)}
                />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-white/50">
              No linked photos found. Browse Google Drive or link photos from
              the Gallery admin.
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

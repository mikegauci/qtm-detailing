"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  Check,
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
  getDrivePickerState,
  getLinkedPhotosForPicker,
} from "@/app/actions/admin/customers";
import { DriveBrowser } from "@/components/admin/drive-browser";
import { DriveThumbnail } from "@/components/admin/drive-thumbnail";
import type { Tables } from "@/lib/supabase/types";
import { parseCarName } from "@/lib/content/parse-car-name";
import { useDriveBrowser } from "@/hooks/use-drive-browser";
import type { DriveImage } from "@/types/drive";
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

type PickerView = "drive" | "linked";

type PickerResult = {
  success: boolean;
  message: string;
};

function SelectionBadge({ selected }: { selected: boolean }) {
  if (!selected) return null;

  return (
    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-purple-600 text-white shadow-md">
      <Check className="h-3.5 w-3.5" />
    </span>
  );
}

function DriveImageOption({
  image,
  disabled,
  selected,
  multiple,
  onToggle,
  onSelect,
}: {
  image: DriveImage;
  disabled: boolean;
  selected: boolean;
  multiple: boolean;
  onToggle: () => void;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={multiple ? onToggle : onSelect}
      className={cn(
        "relative overflow-hidden rounded-lg border text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "border-brand-purple-500 ring-2 ring-brand-purple-500/40"
          : "border-white/10 hover:border-brand-purple-500/50",
      )}
    >
      <DriveThumbnail fileId={image.id} name={image.name} />
      <SelectionBadge selected={multiple && selected} />
      <p className="truncate p-2 text-xs text-white/70">{image.name}</p>
    </button>
  );
}

function LinkedPhotoOption({
  photo,
  disabled,
  selected,
  multiple,
  onToggle,
  onSelect,
}: {
  photo: Tables<"gallery_photos">;
  disabled: boolean;
  selected: boolean;
  multiple: boolean;
  onToggle: () => void;
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
      onClick={multiple ? onToggle : onSelect}
      className={cn(
        "relative overflow-hidden rounded-lg border text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "border-brand-purple-500 ring-2 ring-brand-purple-500/40"
          : "border-white/10 hover:border-brand-purple-500/50",
      )}
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
      <SelectionBadge selected={multiple && selected} />
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
  multiple = false,
  onDriveSelect,
  onLinkedSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  multiple?: boolean;
  onDriveSelect: (driveFileIds: string[]) => Promise<PickerResult>;
  onLinkedSelect: (photoIds: string[]) => Promise<PickerResult>;
}) {
  const [view, setView] = useState<PickerView>("drive");
  const [driveConnected, setDriveConnected] = useState<boolean | null>(null);
  const [photos, setPhotos] = useState<Tables<"gallery_photos">[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const {
    folders,
    images,
    folderStack,
    currentFolder,
    loadingDrive,
    canGoBack,
    openFolder,
    goBack,
    initialize: initializeDriveBrowser,
    reset: resetDriveBrowser,
  } = useDriveBrowser();
  const [selectedDriveIds, setSelectedDriveIds] = useState<string[]>([]);
  const [selectedLinkedIds, setSelectedLinkedIds] = useState<string[]>([]);
  const driveInitializedRef = useRef(false);

  const selectedCount =
    view === "drive" ? selectedDriveIds.length : selectedLinkedIds.length;

  const clearSelection = useCallback(() => {
    setSelectedDriveIds([]);
    setSelectedLinkedIds([]);
  }, []);

  const toggleDriveSelection = useCallback((id: string) => {
    setSelectedDriveIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const toggleLinkedSelection = useCallback((id: string) => {
    setSelectedLinkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  useEffect(() => {
    if (!open) {
      driveInitializedRef.current = false;
      setSearch("");
      setView("drive");
      clearSelection();
      resetDriveBrowser();
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
  }, [open, clearSelection]);

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
    void initializeDriveBrowser();
  }, [open, view, driveConnected, initializeDriveBrowser]);

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

  function runSelection(
    handler: (ids: string[]) => Promise<PickerResult>,
    ids: string[],
  ) {
    startTransition(async () => {
      const result = await handler(ids);
      if (result.success) {
        if (result.message) {
          toast.success(result.message);
        }
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleLinkedSelect(photoId: string) {
    runSelection(onLinkedSelect, [photoId]);
  }

  function handleDriveSelect(driveFileId: string) {
    runSelection(onDriveSelect, [driveFileId]);
  }

  function handleConfirmSelection() {
    if (view === "drive") {
      if (selectedDriveIds.length === 0) return;
      runSelection(onDriveSelect, selectedDriveIds);
      return;
    }

    if (selectedLinkedIds.length === 0) return;
    runSelection(onLinkedSelect, selectedLinkedIds);
  }

  function selectAllDriveImages() {
    setSelectedDriveIds((prev) => {
      const next = new Set(prev);
      for (const image of images) {
        next.add(image.id);
      }
      return [...next];
    });
  }

  function clearCurrentViewSelection() {
    if (view === "drive") {
      setSelectedDriveIds([]);
    } else {
      setSelectedLinkedIds([]);
    }
  }

  const confirmLabel =
    selectedCount === 1
      ? "Add 1 photo"
      : `Add ${selectedCount} photos`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose from Google Drive</DialogTitle>
          <DialogDescription>
            {multiple
              ? "Select one or more photos, then add them."
              : "Browse your Drive folders or pick from previously linked photos."}
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

        {multiple && selectedCount > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-brand-purple-500/30 bg-brand-purple-600/10 px-3 py-2 text-sm">
            <span className="text-white/80">
              {selectedCount} photo{selectedCount !== 1 ? "s" : ""} selected
            </span>
            <button
              type="button"
              onClick={clearCurrentViewSelection}
              className="text-brand-purple-300 hover:text-white"
            >
              Clear
            </button>
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
              <DriveBrowser
                folders={folders}
                images={images}
                folderStack={folderStack}
                currentFolder={currentFolder}
                loadingDrive={loadingDrive}
                canGoBack={canGoBack}
                onOpenFolder={openFolder}
                onGoBack={goBack}
                scrollClassName="space-y-4"
                toolbar={
                  multiple && currentFolder && images.length > 0 ? (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={selectAllDriveImages}
                      >
                        Select all in folder
                      </Button>
                    </div>
                  ) : undefined
                }
                renderImage={(image) => (
                  <DriveImageOption
                    key={image.id}
                    image={image}
                    disabled={isPending}
                    selected={selectedDriveIds.includes(image.id)}
                    multiple={multiple}
                    onToggle={() => toggleDriveSelection(image.id)}
                    onSelect={() => handleDriveSelect(image.id)}
                  />
                )}
              />
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
                  selected={selectedLinkedIds.includes(photo.id)}
                  multiple={multiple}
                  onToggle={() => toggleLinkedSelection(photo.id)}
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

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          {multiple && (
            <Button
              type="button"
              onClick={handleConfirmSelection}
              disabled={isPending || selectedCount === 0}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                confirmLabel
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

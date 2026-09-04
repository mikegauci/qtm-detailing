"use client";

import type { ReactNode } from "react";
import { ChevronLeft, Folder, Loader2 } from "lucide-react";
import type { DriveFolder, DriveImage } from "@/types/drive";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DriveBrowserProps = {
  folders: DriveFolder[];
  images: DriveImage[];
  folderStack: DriveFolder[];
  currentFolder?: DriveFolder;
  loadingDrive: boolean;
  canGoBack: boolean;
  onOpenFolder: (folder: DriveFolder) => void;
  onGoBack: () => void;
  renderImage: (image: DriveImage) => ReactNode;
  toolbar?: ReactNode;
  imageGridClassName?: string;
  scrollClassName?: string;
  showBackButton?: boolean;
};

export function DriveBrowser({
  folders,
  images,
  folderStack,
  currentFolder,
  loadingDrive,
  canGoBack,
  onOpenFolder,
  onGoBack,
  renderImage,
  toolbar,
  imageGridClassName = "grid grid-cols-2 gap-3 sm:grid-cols-3",
  scrollClassName = "max-h-[min(32rem,70vh)] space-y-4 overflow-y-auto pr-1",
  showBackButton = true,
}: DriveBrowserProps) {
  if (loadingDrive) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-white/60">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <div className={scrollClassName}>
      {showBackButton && canGoBack && (
        <div className="mb-4">
          <Button variant="outline" size="sm" onClick={onGoBack}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>
      )}

      {folderStack.length > 0 && (
        <p className="mb-4 truncate text-sm text-white/60">
          {folderStack.map((folder) => folder.name).join(" / ")}
        </p>
      )}

      {folders.map((folder) => (
        <button
          key={folder.id}
          type="button"
          onClick={() => onOpenFolder(folder)}
          className="flex min-h-12 w-full items-center gap-3 rounded-lg border border-white/10 px-4 py-3 text-left text-sm transition-colors hover:bg-white/5"
        >
          <Folder className="h-5 w-5 shrink-0 text-brand-cyan-400" />
          <span className="truncate">{folder.name}</span>
        </button>
      ))}

      {currentFolder && images.length > 0 && (
        <>
          {toolbar}
          <div className={cn("gap-2 sm:gap-3", imageGridClassName)}>
            {images.map((image) => renderImage(image))}
          </div>
        </>
      )}

      {folders.length === 0 && images.length === 0 && (
        <p className="py-6 text-center text-sm text-white/50">
          This folder is empty.
        </p>
      )}
    </div>
  );
}

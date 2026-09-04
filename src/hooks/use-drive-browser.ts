"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  findDriveRootFolder,
  listDriveFolders,
  listDriveImages,
} from "@/app/actions/admin/gallery";
import type { DriveFolder, DriveImage } from "@/types/drive";

type UseDriveBrowserOptions = {
  rootFolderName?: string;
};

export function useDriveBrowser(options: UseDriveBrowserOptions = {}) {
  const { rootFolderName = "QTM Detailing" } = options;
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [images, setImages] = useState<DriveImage[]>([]);
  const [folderStack, setFolderStack] = useState<DriveFolder[]>([]);
  const [loadingDrive, setLoadingDrive] = useState(false);

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

  const goBack = useCallback(async () => {
    if (folderStack.length <= 1) return;
    const nextStack = folderStack.slice(0, -1);
    setFolderStack(nextStack);
    await loadFolderContents(nextStack);
  }, [folderStack, loadFolderContents]);

  const initialize = useCallback(async () => {
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
        toast.message(
          `"${rootFolderName}" folder not found — showing Drive root.`,
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load Google Drive",
      );
    } finally {
      setLoadingDrive(false);
    }
  }, [rootFolderName]);

  const reset = useCallback(() => {
    setFolders([]);
    setImages([]);
    setFolderStack([]);
    setLoadingDrive(false);
  }, []);

  return {
    folders,
    images,
    folderStack,
    currentFolder,
    loadingDrive,
    canGoBack,
    openFolder,
    goBack,
    initialize,
    reset,
  };
}

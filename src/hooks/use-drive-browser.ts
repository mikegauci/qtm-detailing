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
  const [connectionExpired, setConnectionExpired] = useState(false);

  const currentFolder = folderStack[folderStack.length - 1];
  const canGoBack = folderStack.length > 1;

  const handleDriveError = useCallback((message: string, expired?: boolean) => {
    if (expired) {
      setConnectionExpired(true);
    }
    toast.error(message);
  }, []);

  const loadFolderContents = useCallback(
    async (stack: DriveFolder[]) => {
      setLoadingDrive(true);
      try {
        const folder = stack[stack.length - 1];
        const parentId = folder?.id;

        const [foldersResult, imagesResult] = await Promise.all([
          listDriveFolders(parentId),
          parentId
            ? listDriveImages(parentId)
            : Promise.resolve({ success: true as const, data: [] }),
        ]);

        if (!foldersResult.success) {
          handleDriveError(foldersResult.message, foldersResult.expired);
          return;
        }

        if (!imagesResult.success) {
          handleDriveError(imagesResult.message, imagesResult.expired);
          return;
        }

        setFolders(foldersResult.data);
        setImages(imagesResult.data);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to load folder",
        );
      } finally {
        setLoadingDrive(false);
      }
    },
    [handleDriveError],
  );

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
      const rootResult = await findDriveRootFolder();
      if (!rootResult.success) {
        handleDriveError(rootResult.message, rootResult.expired);
        return;
      }

      const rootFolder = rootResult.data;
      if (rootFolder) {
        setFolderStack([rootFolder]);
        const [foldersResult, imagesResult] = await Promise.all([
          listDriveFolders(rootFolder.id),
          listDriveImages(rootFolder.id),
        ]);

        if (!foldersResult.success) {
          handleDriveError(foldersResult.message, foldersResult.expired);
          return;
        }

        if (!imagesResult.success) {
          handleDriveError(imagesResult.message, imagesResult.expired);
          return;
        }

        setFolders(foldersResult.data);
        setImages(imagesResult.data);
      } else {
        const rootFoldersResult = await listDriveFolders();
        if (!rootFoldersResult.success) {
          handleDriveError(
            rootFoldersResult.message,
            rootFoldersResult.expired,
          );
          return;
        }

        setFolders(rootFoldersResult.data);
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
  }, [handleDriveError, rootFolderName]);

  const reset = useCallback(() => {
    setFolders([]);
    setImages([]);
    setFolderStack([]);
    setLoadingDrive(false);
    setConnectionExpired(false);
  }, []);

  return {
    folders,
    images,
    folderStack,
    currentFolder,
    loadingDrive,
    connectionExpired,
    canGoBack,
    openFolder,
    goBack,
    initialize,
    reset,
  };
}

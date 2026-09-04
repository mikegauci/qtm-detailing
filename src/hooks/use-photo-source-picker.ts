"use client";

import { useCallback, useState } from "react";

export function usePhotoSourcePicker() {
  const [sourceDialogOpen, setSourceDialogOpen] = useState(false);
  const [linkedPickerOpen, setLinkedPickerOpen] = useState(false);

  const openSourceDialog = useCallback(() => {
    setSourceDialogOpen(true);
  }, []);

  const chooseDeviceUpload = useCallback((openFilePicker: () => void) => {
    setSourceDialogOpen(false);
    openFilePicker();
  }, []);

  const chooseLinkedPhoto = useCallback(() => {
    setSourceDialogOpen(false);
    setLinkedPickerOpen(true);
  }, []);

  return {
    sourceDialogOpen,
    linkedPickerOpen,
    setSourceDialogOpen,
    setLinkedPickerOpen,
    openSourceDialog,
    chooseDeviceUpload,
    chooseLinkedPhoto,
  };
}

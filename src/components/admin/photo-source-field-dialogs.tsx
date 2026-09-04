"use client";

import { LinkedPhotoPickerDialog } from "@/components/admin/linked-photo-picker-dialog";
import { PhotoSourceDialog } from "@/components/admin/photo-source-dialog";

type PickerResult = {
  success: boolean;
  message: string;
};

type PhotoSourceFieldDialogsProps = {
  title: string;
  description?: string;
  disabled?: boolean;
  multiple?: boolean;
  sourceDialogOpen: boolean;
  linkedPickerOpen: boolean;
  setSourceDialogOpen: (open: boolean) => void;
  setLinkedPickerOpen: (open: boolean) => void;
  chooseDeviceUpload: (openFilePicker: () => void) => void;
  chooseLinkedPhoto: () => void;
  openFilePicker: () => void;
  onDriveSelect: (driveFileIds: string[]) => Promise<PickerResult>;
  onLinkedSelect: (photoIds: string[]) => Promise<PickerResult>;
};

export function PhotoSourceFieldDialogs({
  title,
  description,
  disabled = false,
  multiple = false,
  sourceDialogOpen,
  linkedPickerOpen,
  setSourceDialogOpen,
  setLinkedPickerOpen,
  chooseDeviceUpload,
  chooseLinkedPhoto,
  openFilePicker,
  onDriveSelect,
  onLinkedSelect,
}: PhotoSourceFieldDialogsProps) {
  return (
    <>
      <PhotoSourceDialog
        open={sourceDialogOpen}
        onOpenChange={setSourceDialogOpen}
        title={title}
        description={description}
        onChooseDevice={() => chooseDeviceUpload(openFilePicker)}
        onChooseDrive={chooseLinkedPhoto}
        disabled={disabled}
      />

      <LinkedPhotoPickerDialog
        open={linkedPickerOpen}
        onOpenChange={setLinkedPickerOpen}
        multiple={multiple}
        onDriveSelect={onDriveSelect}
        onLinkedSelect={onLinkedSelect}
      />
    </>
  );
}

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  type DraggableAttributes,
} from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  uploadServiceImage,
  uploadServiceImageFromDrive,
  uploadServiceImageFromLinked,
} from "@/app/actions/admin/cms";
import {
  EnhancePromptDialog,
  type EnhancePromptResult,
} from "@/components/admin/enhance-prompt-dialog";
import {
  UploadQueueImageCard,
  buildUploadQueue,
  createQueueItemProcessor,
  revokeUploadQueueBlobUrls,
  type UploadQueueItem,
} from "@/components/admin/enhancement-progress-overlay";
import { HiddenImageFileInput } from "@/components/admin/hidden-image-file-input";
import { PhotoSourceFieldDialogs } from "@/components/admin/photo-source-field-dialogs";
import { serviceImageStyle } from "@/lib/content/service-images";
import { useMounted } from "@/hooks/use-mounted";
import { usePhotoSourcePicker } from "@/hooks/use-photo-source-picker";
import { useSortableSensors } from "@/hooks/use-sortable-sensors";
import type { ServiceImage } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ServiceImagesFieldProps = {
  label?: string;
  value: ServiceImage[];
  onChange: (images: ServiceImage[]) => void;
  slug: string;
};

type PendingServiceUpload =
  | { type: "device"; files: File[] }
  | { type: "drive"; driveFileIds: string[] }
  | { type: "linked"; photoIds: string[] };

function ServiceImageCard({
  image,
  index,
  onFocalChange,
  onZoomChange,
  onRemove,
  dragHandle,
}: {
  image: ServiceImage;
  index: number;
  onFocalChange: (focalY: number) => void;
  onZoomChange: (zoom: number) => void;
  onRemove: () => void;
  dragHandle?: {
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
  };
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="mb-3 flex items-center gap-2">
        {dragHandle ? (
          <button
            type="button"
            className="cursor-grab touch-none text-white/40 hover:text-white/70 active:cursor-grabbing"
            aria-label={`Reorder photo ${index + 1}`}
            {...dragHandle.attributes}
            {...dragHandle.listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        ) : (
          <div className="text-white/20">
            <GripVertical className="h-4 w-4" />
          </div>
        )}
        <span className="text-sm text-white/60">Photo {index + 1}</span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="ml-auto h-7 px-2"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="relative aspect-[16/10] overflow-hidden rounded-md border border-white/10">
        <Image
          src={image.url}
          alt={`Service photo ${index + 1}`}
          fill
          className="object-cover"
          style={serviceImageStyle(image)}
          sizes="400px"
        />
      </div>

      <div className="mt-3 space-y-1">
        <Label className="text-xs text-white/60">Vertical position</Label>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={image.focalY}
          onChange={(e) => onFocalChange(Number(e.target.value))}
          className="w-full accent-brand-purple-400"
        />
        <div className="flex justify-between text-[10px] text-white/40">
          <span>Top</span>
          <span>Center</span>
          <span>Bottom</span>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <Label className="text-xs text-white/60">Zoom</Label>
        <input
          type="range"
          min={100}
          max={250}
          step={5}
          value={image.zoom}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          className="w-full accent-brand-purple-400"
        />
        <div className="flex justify-between text-[10px] text-white/40">
          <span>1×</span>
          <span>{(image.zoom / 100).toFixed(2).replace(/\.?0+$/, "")}×</span>
          <span>2.5×</span>
        </div>
      </div>
    </div>
  );
}

function SortableImageItem({
  image,
  index,
  onFocalChange,
  onZoomChange,
  onRemove,
}: {
  image: ServiceImage;
  index: number;
  onFocalChange: (focalY: number) => void;
  onZoomChange: (zoom: number) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-60")}
    >
      <ServiceImageCard
        image={image}
        index={index}
        onFocalChange={onFocalChange}
        onZoomChange={onZoomChange}
        onRemove={onRemove}
        dragHandle={{ attributes, listeners }}
      />
    </div>
  );
}

export function ServiceImagesField({
  label = "Service photos",
  value,
  onChange,
  slug,
}: ServiceImagesFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [uploadCount, setUploadCount] = useState(0);
  const {
    sourceDialogOpen,
    linkedPickerOpen,
    setSourceDialogOpen,
    setLinkedPickerOpen,
    openSourceDialog,
    chooseDeviceUpload,
    chooseLinkedPhoto,
  } = usePhotoSourcePicker();
  const [enhanceDialogOpen, setEnhanceDialogOpen] = useState(false);
  const [pendingPhotoCount, setPendingPhotoCount] = useState(1);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const pendingUploadRef = useRef<PendingServiceUpload | null>(null);
  const mounted = useMounted();

  useEffect(() => {
    return () => {
      revokeUploadQueueBlobUrls(uploadQueue);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- revoke blob URLs on unmount only
  }, []);

  const sensors = useSortableSensors();

  const openEnhanceDialog = (upload: PendingServiceUpload) => {
    pendingUploadRef.current = upload;
    setPendingPhotoCount(
      upload.type === "device"
        ? upload.files.length
        : upload.type === "drive"
          ? upload.driveFileIds.length
          : upload.photoIds.length,
    );
    setEnhanceDialogOpen(true);
  };

  const runPendingUpload = ({ enhance, blankPlate }: EnhancePromptResult) => {
    const pending = pendingUploadRef.current;
    if (!pending) return;

    pendingUploadRef.current = null;
    const processing = { enhance, blankPlate };
    setIsEnhancing(enhance || blankPlate);

    const queue = buildUploadQueue(pending);
    setUploadQueue(queue);
    setUploadCount(queue.length);
    setUploadProgress({ current: 0, total: queue.length });

    startTransition(async () => {
      let successCount = 0;
      let accumulatedImages = [...value];

      const processItem = createQueueItemProcessor({
        queue,
        setQueue: setUploadQueue,
        setProgress: setUploadProgress,
        onSuccess: (_item, result) => {
          if (result.url) {
            successCount += 1;
            accumulatedImages = [
              ...accumulatedImages,
              { url: result.url, focalY: 50, zoom: 100 },
            ];
            onChange(accumulatedImages);
          }
        },
      });

      if (pending.type === "device") {
        for (const [index, file] of pending.files.entries()) {
          const formData = new FormData();
          formData.set("file", file);
          await processItem(queue[index], async () => {
            const result = await uploadServiceImage(formData, slug, processing);
            return result;
          });
        }
      } else if (pending.type === "drive") {
        for (const [index, driveFileId] of pending.driveFileIds.entries()) {
          await processItem(queue[index], async () => {
            const result = await uploadServiceImageFromDrive(
              driveFileId,
              slug,
              processing,
            );
            return result;
          });
        }
      } else {
        for (const [index, photoId] of pending.photoIds.entries()) {
          await processItem(queue[index], async () => {
            const result = await uploadServiceImageFromLinked(
              photoId,
              slug,
              processing,
            );
            return result;
          });
        }
      }

      if (successCount > 0) {
        toast.success(
          successCount === 1
            ? "Photo uploaded."
            : `${successCount} photos uploaded.`,
        );
      }

      revokeUploadQueueBlobUrls(queue);
      setUploadQueue((current) => current.filter((entry) => entry.status === "error"));
      setUploadCount(0);
      setUploadProgress({ current: 0, total: 0 });
      setIsEnhancing(false);
    });
  };

  const handleUpload = (files: FileList) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    openEnhanceDialog({ type: "device", files: fileArray });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = value.findIndex((img) => img.url === active.id);
    const newIndex = value.findIndex((img) => img.url === over.id);
    onChange(arrayMove(value, oldIndex, newIndex));
  };

  const updateImage = (index: number, patch: Partial<ServiceImage>) => {
    onChange(
      value.map((img, i) => (i === index ? { ...img, ...patch } : img)),
    );
  };

  const openFilePicker = () => inputRef.current?.click();

  return (
    <>
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={isPending}
          onClick={openSourceDialog}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              {isEnhancing ? "Processing" : "Uploading"}
              {uploadProgress.total > 0
                ? ` ${uploadProgress.current}/${uploadProgress.total}`
                : uploadCount > 1
                  ? ` (${uploadCount})`
                  : ""}
              …
            </>
          ) : (
            <>
              <Upload className="mr-1 h-3 w-3" />
              Add photos
            </>
          )}
        </Button>
      </div>

      {value.length === 0 && uploadQueue.length === 0 ? (
        <button
          type="button"
          disabled={isPending}
          onClick={openSourceDialog}
          className="flex min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-4 text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white/70 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <>
              <ImageIcon className="h-8 w-8" />
              <span className="text-sm">Click to add photos</span>
              <span className="text-xs text-white/40">
                Upload from device or browse Google Drive
              </span>
            </>
          )}
        </button>
      ) : null}

      {value.length > 0 ? (
        mounted ? (
          <DndContext
            id="service-images-list"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={value.map((img) => img.url)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {value.map((image, index) => (
                  <SortableImageItem
                    key={image.url}
                    image={image}
                    index={index}
                    onFocalChange={(focalY) => updateImage(index, { focalY })}
                    onZoomChange={(zoom) => updateImage(index, { zoom })}
                    onRemove={() =>
                      onChange(value.filter((_, i) => i !== index))
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="space-y-3">
            {value.map((image, index) => (
              <ServiceImageCard
                key={image.url}
                image={image}
                index={index}
                onFocalChange={(focalY) => updateImage(index, { focalY })}
                onZoomChange={(zoom) => updateImage(index, { zoom })}
                onRemove={() => onChange(value.filter((_, i) => i !== index))}
              />
            ))}
          </div>
        )
      ) : null}

      {uploadQueue.length > 0 ? (
        <div className="space-y-3">
          {uploadQueue.map((item, index) => (
            <UploadQueueImageCard
              key={item.id}
              previewUrl={item.previewUrl}
              label={item.label}
              status={item.status}
              current={uploadProgress.current || index + 1}
              total={uploadProgress.total || uploadQueue.length}
              isEnhancing={isEnhancing}
              errorMessage={item.errorMessage}
            />
          ))}
        </div>
      ) : null}

      <HiddenImageFileInput
        inputRef={inputRef}
        multiple
        onSelect={handleUpload}
      />
    </div>

    <PhotoSourceFieldDialogs
      title="Add service photo"
      description="Upload one or more images, or browse Google Drive to select multiple photos."
      disabled={isPending}
      multiple
      sourceDialogOpen={sourceDialogOpen}
      linkedPickerOpen={linkedPickerOpen}
      setSourceDialogOpen={setSourceDialogOpen}
      setLinkedPickerOpen={setLinkedPickerOpen}
      chooseDeviceUpload={chooseDeviceUpload}
      chooseLinkedPhoto={chooseLinkedPhoto}
      openFilePicker={openFilePicker}
      onDriveSelect={async (driveFileIds) => {
        openEnhanceDialog({ type: "drive", driveFileIds });
        return { success: true, message: "" };
      }}
      onLinkedSelect={async (photoIds) => {
        openEnhanceDialog({ type: "linked", photoIds });
        return { success: true, message: "" };
      }}
    />

    <EnhancePromptDialog
      open={enhanceDialogOpen}
      onOpenChange={setEnhanceDialogOpen}
      title="Add service photo"
      photoCount={pendingPhotoCount}
      confirmLabel="Add photos"
      onConfirm={runPendingUpload}
    />
    </>
  );
}

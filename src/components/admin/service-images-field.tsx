"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { uploadCmsAsset } from "@/app/actions/admin/cms";
import { serviceImageObjectPosition } from "@/lib/content/service-images";
import { useMounted } from "@/hooks/use-mounted";
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

function ImageItem({
  image,
  index,
  onFocalChange,
  onRemove,
}: {
  image: ServiceImage;
  index: number;
  onFocalChange: (focalY: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="mb-3 flex items-center gap-2">
        <div className="text-white/20">
          <GripVertical className="h-4 w-4" />
        </div>
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
          style={{ objectPosition: serviceImageObjectPosition(image.focalY) }}
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
    </div>
  );
}

function SortableImageItem({
  image,
  index,
  onFocalChange,
  onRemove,
}: {
  image: ServiceImage;
  index: number;
  onFocalChange: (focalY: number) => void;
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
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab touch-none text-white/40 hover:text-white/70 active:cursor-grabbing"
            aria-label={`Reorder photo ${index + 1}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
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
            style={{ objectPosition: serviceImageObjectPosition(image.focalY) }}
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
      </div>
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
  const mounted = useMounted();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleUpload = (files: FileList) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploadCount(fileArray.length);

    startTransition(async () => {
      const uploaded: ServiceImage[] = [];

      for (const file of fileArray) {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("folder", "services");
        formData.set(
          "filename",
          `${slug || "service"}-${crypto.randomUUID().slice(0, 8)}`,
        );

        const result = await uploadCmsAsset(formData);
        if (result.success && result.url) {
          uploaded.push({ url: result.url, focalY: 50 });
        } else {
          toast.error(result.message);
        }
      }

      if (uploaded.length > 0) {
        onChange([...value, ...uploaded]);
        toast.success(
          uploaded.length === 1
            ? "Photo uploaded."
            : `${uploaded.length} photos uploaded.`,
        );
      }

      setUploadCount(0);
    });
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Uploading{uploadCount > 1 ? ` (${uploadCount})` : ""}…
            </>
          ) : (
            <>
              <Upload className="mr-1 h-3 w-3" />
              Add photos
            </>
          )}
        </Button>
      </div>

      {value.length === 0 ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
          className="flex min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-4 text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white/70 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <>
              <ImageIcon className="h-8 w-8" />
              <span className="text-sm">Click to upload photos</span>
              <span className="text-xs text-white/40">
                Multiple photos will appear as a slider on the services page
              </span>
            </>
          )}
        </button>
      ) : mounted ? (
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
            <ImageItem
              key={image.url}
              image={image}
              index={index}
              onFocalChange={(focalY) => updateImage(index, { focalY })}
              onRemove={() => onChange(value.filter((_, i) => i !== index))}
            />
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files) handleUpload(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

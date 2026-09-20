"use client";

import { galleryPhotoCategoryOptions } from "@/lib/content/gallery-categories";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type GalleryPhotoMetadataFieldsProps = {
  photoType: "before" | "after";
  category: string;
  onPhotoTypeChange: (value: "before" | "after") => void;
  onCategoryChange: (value: string) => void;
  compact?: boolean;
  layout?: "stacked" | "inline";
  className?: string;
};

export function GalleryPhotoMetadataFields({
  photoType,
  category,
  onPhotoTypeChange,
  onCategoryChange,
  compact = false,
  layout = "stacked",
  className,
}: GalleryPhotoMetadataFieldsProps) {
  const fieldSpacing = compact ? "space-y-1.5" : "space-y-2";
  const labelClassName = compact ? "text-xs text-white/60" : undefined;

  return (
    <div
      className={cn(
        layout === "inline"
          ? "flex shrink-0 items-center gap-3"
          : "grid grid-cols-1 gap-4 sm:grid-cols-2",
        className,
      )}
    >
      <div
        className={cn(
          layout === "inline"
            ? "flex items-center gap-2"
            : fieldSpacing,
        )}
      >
        <Label className={cn(labelClassName, layout === "inline" && "shrink-0")}>
          Type
        </Label>
        <Select
          value={photoType}
          onValueChange={(value) => onPhotoTypeChange(value as "before" | "after")}
        >
          <SelectTrigger className={compact ? "h-8 w-[6.5rem]" : undefined}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="before">Before</SelectItem>
            <SelectItem value="after">After</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div
        className={cn(
          layout === "inline"
            ? "flex items-center gap-2"
            : fieldSpacing,
        )}
      >
        <Label className={cn(labelClassName, layout === "inline" && "shrink-0")}>
          Category
        </Label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className={compact ? "h-8 w-[10.5rem]" : undefined}>
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
  );
}

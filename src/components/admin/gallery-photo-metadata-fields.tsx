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
  className?: string;
};

export function GalleryPhotoMetadataFields({
  photoType,
  category,
  onPhotoTypeChange,
  onCategoryChange,
  compact = false,
  className,
}: GalleryPhotoMetadataFieldsProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}>
      <div className="space-y-2">
        <Label className={compact ? "text-xs text-white/60" : undefined}>
          Type
        </Label>
        <Select
          value={photoType}
          onValueChange={(value) => onPhotoTypeChange(value as "before" | "after")}
        >
          <SelectTrigger className={compact ? "h-8" : undefined}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="before">Before</SelectItem>
            <SelectItem value="after">After</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className={compact ? "text-xs text-white/60" : undefined}>
          Category
        </Label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className={compact ? "h-8" : undefined}>
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

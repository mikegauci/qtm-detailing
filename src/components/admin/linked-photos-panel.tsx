"use client";

import { useEffect, useMemo, useState } from "react";
import { EyeOff, ImageIcon, Pencil, Search, Sparkles, Trash2, Upload } from "lucide-react";
import type { Tables } from "@/lib/supabase/types";
import { parseCarName } from "@/lib/content/parse-car-name";
import { galleryPhotoDisplayUrl } from "@/lib/cms/gallery-photo-url";
import {
  galleryPhotoCategoryIds,
  galleryPhotoCategoryOptions,
} from "@/lib/content/gallery-categories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollCarousel } from "@/components/ui/scroll-carousel";
import { cn } from "@/lib/utils";

type LinkedPhotosPanelProps = {
  photos: Tables<"gallery_photos">[];
  isPending: boolean;
  onPublish: (photoId: string) => void;
  onEnhance: (photoId: string) => void;
  onUnpublish: (photoId: string) => void;
  onDelete: (photoId: string) => void;
  onPublishAllDrafts: (photoIds: string[]) => void;
  onUpdate: (
    photoId: string,
    photoType: "before" | "after",
    category: string,
  ) => void;
};

type StatusFilter = "all" | "published" | "draft";
type TypeFilter = "all" | "before" | "after";

function getPhotoActivityTime(photo: Tables<"gallery_photos">): number {
  const created = new Date(photo.created_at).getTime();
  const enhanced = photo.ai_enhanced_at
    ? new Date(photo.ai_enhanced_at).getTime()
    : 0;
  return Math.max(created, enhanced);
}

function LinkedPhotoThumbnail({
  photo,
  className,
}: {
  photo: Tables<"gallery_photos">;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const carName = photo.drive_folder_name
    ? parseCarName(photo.drive_folder_name)
    : "Linked photo";
  const src =
    photo.publish_to_gallery && photo.photo_url
      ? galleryPhotoDisplayUrl(photo.photo_url, photo.ai_enhanced_at)
      : photo.drive_file_id
        ? `/api/google-drive/thumbnail/${photo.drive_file_id}`
        : null;

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex aspect-square w-full items-center justify-center rounded-lg bg-white/10",
          className,
        )}
      >
        <ImageIcon className="h-8 w-8 text-white/40" />
      </div>
    );
  }

  return (
    <img
      key={src}
      src={src}
      alt={carName}
      loading="lazy"
      className={cn(
        "aspect-square w-full rounded-lg object-cover bg-white/10",
        className,
      )}
      onError={() => setFailed(true)}
    />
  );
}

function LinkedPhotoCard({
  photo,
  isPending,
  onPublish,
  onEnhance,
  onUnpublish,
  onDelete,
  onUpdate,
}: {
  photo: Tables<"gallery_photos">;
  isPending: boolean;
  onPublish: (photoId: string) => void;
  onEnhance: (photoId: string) => void;
  onUnpublish: (photoId: string) => void;
  onDelete: (photoId: string) => void;
  onUpdate: (
    photoId: string,
    photoType: "before" | "after",
    category: string,
  ) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [photoType, setPhotoType] = useState<"before" | "after">(
    photo.photo_type === "after" ? "after" : "before",
  );
  const [category, setCategory] = useState(photo.category ?? "exterior");

  const hasChanges =
    photoType !== photo.photo_type || category !== (photo.category ?? "exterior");

  useEffect(() => {
    setPhotoType(photo.photo_type === "after" ? "after" : "before");
    setCategory(photo.category ?? "exterior");
  }, [photo.id, photo.photo_type, photo.category]);

  const handleSave = () => {
    onUpdate(photo.id, photoType, category);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setPhotoType(photo.photo_type === "after" ? "after" : "before");
    setCategory(photo.category ?? "exterior");
    setIsEditing(false);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
      <LinkedPhotoThumbnail photo={photo} />
      <div className="space-y-3 p-3">
        {isEditing ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-white/60">Type</Label>
              <Select
                value={photoType}
                onValueChange={(value) =>
                  setPhotoType(value as "before" | "after")
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before">Before</SelectItem>
                  <SelectItem value="after">After</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-white/60">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-8">
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
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={handleSave}
                disabled={isPending || !hasChanges}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="capitalize">
                {photo.photo_type}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {photo.category ?? "exterior"}
              </Badge>
              <Badge
                variant="outline"
                className={
                  photo.publish_to_gallery
                    ? "border-brand-cyan-400/40 text-brand-cyan-300"
                    : "border-amber-400/40 text-amber-300"
                }
              >
                {photo.publish_to_gallery ? "Published" : "Draft"}
              </Badge>
              {photo.ai_enhanced_at ? (
                <Badge
                  variant="outline"
                  className="border-brand-purple-400/40 text-brand-purple-300"
                >
                  AI Enhanced
                </Badge>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={isPending}
              >
                <Pencil className="mr-1 h-3 w-3" />
                Edit
              </Button>
              {!photo.publish_to_gallery && photo.drive_file_id && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onPublish(photo.id)}
                  disabled={isPending}
                >
                  <Upload className="mr-1 h-3 w-3" />
                  Publish
                </Button>
              )}
              {photo.publish_to_gallery && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onUnpublish(photo.id)}
                  disabled={isPending}
                >
                  <EyeOff className="mr-1 h-3 w-3" />
                  Unpublish
                </Button>
              )}
              {photo.publish_to_gallery &&
                photo.drive_file_id &&
                !photo.ai_enhanced_at && (
                <Button
                  size="sm"
                  className="bg-brand-purple-600 text-white hover:bg-brand-purple-500"
                  onClick={() => onEnhance(photo.id)}
                  disabled={isPending}
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  Enhance
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(photo.id)}
                disabled={isPending}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function LinkedPhotosPanel({
  photos,
  isPending,
  onPublish,
  onEnhance,
  onUnpublish,
  onDelete,
  onPublishAllDrafts,
  onUpdate,
}: LinkedPhotosPanelProps) {
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const vehicleOptions = useMemo(
    () =>
      Array.from(
        new Set(
          photos
            .map((photo) =>
              photo.drive_folder_name
                ? parseCarName(photo.drive_folder_name)
                : null,
            )
            .filter(Boolean),
        ),
      ).sort() as string[],
    [photos],
  );

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...galleryPhotoCategoryIds,
          ...photos.map((photo) => photo.category).filter(Boolean),
        ]),
      ).sort() as string[],
    [photos],
  );

  const filteredPhotos = useMemo(() => {
    const query = search.trim().toLowerCase();

    return photos.filter((photo) => {
      const carName = photo.drive_folder_name
        ? parseCarName(photo.drive_folder_name)
        : "Unknown car";

      if (vehicleFilter !== "all" && carName !== vehicleFilter) {
        return false;
      }

      if (statusFilter === "published" && !photo.publish_to_gallery) {
        return false;
      }

      if (statusFilter === "draft" && photo.publish_to_gallery) {
        return false;
      }

      if (typeFilter !== "all" && photo.photo_type !== typeFilter) {
        return false;
      }

      if (categoryFilter !== "all" && photo.category !== categoryFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        carName.toLowerCase().includes(query) ||
        (photo.drive_folder_name?.toLowerCase().includes(query) ?? false) ||
        photo.photo_type.toLowerCase().includes(query) ||
        (photo.category?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [photos, search, vehicleFilter, statusFilter, typeFilter, categoryFilter]);

  const groupedPhotos = useMemo(() => {
    const groups = new Map<string, Tables<"gallery_photos">[]>();

    for (const photo of filteredPhotos) {
      const carName = photo.drive_folder_name
        ? parseCarName(photo.drive_folder_name)
        : "Unknown car";
      const existing = groups.get(carName) ?? [];
      existing.push(photo);
      groups.set(carName, existing);
    }

    return Array.from(groups.entries())
      .map(([carName, items]) => {
        const sortedItems = [...items].sort(
          (a, b) => getPhotoActivityTime(b) - getPhotoActivityTime(a),
        );

        return {
          carName,
          items: sortedItems,
          latestActivity: Math.max(...sortedItems.map(getPhotoActivityTime)),
          draftIds: sortedItems
            .filter((item) => !item.publish_to_gallery && item.drive_file_id)
            .map((item) => item.id),
        };
      })
      .sort((a, b) => {
        if (b.latestActivity !== a.latestActivity) {
          return b.latestActivity - a.latestActivity;
        }
        return a.carName.localeCompare(b.carName);
      });
  }, [filteredPhotos]);

  const draftCount = photos.filter(
    (photo) => !photo.publish_to_gallery && photo.drive_file_id,
  ).length;
  const publishedCount = photos.filter((photo) => photo.publish_to_gallery).length;
  const allDraftIds = photos
    .filter((photo) => !photo.publish_to_gallery && photo.drive_file_id)
    .map((photo) => photo.id);

  const hasActiveFilters =
    search.trim().length > 0 ||
    vehicleFilter !== "all" ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    categoryFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setVehicleFilter("all");
    setStatusFilter("all");
    setTypeFilter("all");
    setCategoryFilter("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-white/60">
            {photos.length} linked · {publishedCount} published · {draftCount}{" "}
            drafts
            {filteredPhotos.length !== photos.length && (
              <> · showing {filteredPhotos.length}</>
            )}
          </p>
        </div>
        {allDraftIds.length > 1 && (
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => onPublishAllDrafts(allDraftIds)}
            disabled={isPending}
          >
            <Upload className="mr-1 h-3 w-3" />
            Publish all drafts
          </Button>
        )}
      </div>

      <div className="grid gap-4 rounded-xl border border-white/10 bg-black/20 p-4 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
        <div className="space-y-2">
          <Label htmlFor="linked-search">Search</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              id="linked-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search vehicle or folder..."
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Vehicle</Label>
          <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All vehicles</SelectItem>
              {vehicleOptions.map((vehicle) => (
                <SelectItem key={vehicle} value={vehicle}>
                  {vehicle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as TypeFilter)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="before">Before</SelectItem>
              <SelectItem value="after">After</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categoryOptions.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      )}

      {photos.length === 0 ? (
        <p className="py-12 text-center text-sm text-white/60">
          No photos linked yet. Import from Google Drive to get started.
        </p>
      ) : filteredPhotos.length === 0 ? (
        <p className="py-12 text-center text-sm text-white/60">
          No photos match your filters.
        </p>
      ) : (
        <div className="space-y-8">
          {groupedPhotos.map((group) => (
            <section key={group.carName} className="space-y-4">
              <div className="flex flex-col gap-3 border-b border-white/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{group.carName}</h3>
                  <p className="text-sm text-white/60">
                    {group.items.length} photo
                    {group.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                {group.draftIds.length > 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPublishAllDrafts(group.draftIds)}
                    disabled={isPending}
                  >
                    <Upload className="mr-1 h-3 w-3" />
                    Publish {group.draftIds.length} drafts
                  </Button>
                )}
              </div>
              <div className="-mx-4 px-4 sm:hidden">
                <ScrollCarousel itemClassName="w-[min(88vw,340px)]">
                  {group.items.map((photo) => (
                    <LinkedPhotoCard
                      key={photo.id}
                      photo={photo}
                      isPending={isPending}
                      onPublish={onPublish}
                      onEnhance={onEnhance}
                      onUnpublish={onUnpublish}
                      onDelete={onDelete}
                      onUpdate={onUpdate}
                    />
                  ))}
                </ScrollCarousel>
              </div>
              <div className="hidden gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {group.items.map((photo) => (
                  <LinkedPhotoCard
                    key={photo.id}
                    photo={photo}
                    isPending={isPending}
                    onPublish={onPublish}
                    onEnhance={onEnhance}
                    onUnpublish={onUnpublish}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

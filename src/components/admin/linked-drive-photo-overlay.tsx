import { getGalleryPhotoCategoryLabel } from "@/lib/content/gallery-categories";
import { cn } from "@/lib/utils";

type LinkedDrivePhotoOverlayProps = {
  photoType: string;
  category: string | null;
  published?: boolean;
  className?: string;
};

export function LinkedDrivePhotoOverlay({
  photoType,
  category,
  published = true,
  className,
}: LinkedDrivePhotoOverlayProps) {
  const typeLabel = photoType === "after" ? "After" : "Before";
  const categoryLabel = getGalleryPhotoCategoryLabel(category);
  const label = `${typeLabel} · ${categoryLabel}`;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-1.5 pb-1 pt-5 text-left sm:px-2 sm:pb-1.5 sm:pt-6",
        className,
      )}
    >
      <p
        className="truncate text-[10px] font-medium leading-tight text-white sm:text-xs"
        title={label}
      >
        {label}
      </p>
      {!published && (
        <p className="truncate text-[9px] text-amber-300 sm:text-[10px]">Draft</p>
      )}
    </div>
  );
}

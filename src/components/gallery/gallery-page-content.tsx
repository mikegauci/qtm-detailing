"use client";

import dynamic from "next/dynamic";
import {
  Children,
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getGalleryLightboxData } from "@/app/actions/gallery-lightbox";
import {
  galleryCategories,
  getGalleryPhotoLabel,
} from "@/lib/content/gallery-categories";
import type { GalleryCategory, GalleryPhoto } from "@/types/content";
import type { SectionHeadingContent } from "@/types/page-sections";
import type { GalleryPhotoTypeFilter } from "@/lib/content/gallery-photo-utils";
import { GALLERY_PAGE_SIZE } from "@/lib/content/gallery-photo-utils";
import { getVisiblePageNumbers } from "@/lib/content/gallery-photo-utils";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/motion/fade-in";
import { cn } from "@/lib/utils";

const GalleryLightbox = dynamic(
  () =>
    import("@/components/gallery/gallery-lightbox").then(
      (mod) => mod.GalleryLightbox,
    ),
  { ssr: false },
);

type GalleryPageContentProps = {
  photos: GalleryPhoto[];
  filteredCount: number;
  carNames: string[];
  filters: {
    category: GalleryCategory;
    selectedCar: string;
    photoTypeFilter: GalleryPhotoTypeFilter;
    currentPage: number;
  };
  totalPages: number;
  currentPage: number;
  hero: SectionHeadingContent;
};

function buildGalleryUrl(
  baseParams: URLSearchParams,
  updates: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams(baseParams.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `/gallery?${query}` : "/gallery";
}

function FilterPill({
  active,
  onClick,
  children,
  variant = "purple",
  size = "md",
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  variant?: "purple" | "cyan";
  size?: "md" | "sm";
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full transition-colors",
        size === "md"
          ? "min-h-10 px-4 py-2 text-sm font-medium"
          : "min-h-9 px-3 py-1.5 text-sm",
        active
          ? variant === "purple"
            ? "bg-brand-purple-600 text-white"
            : "border border-brand-cyan-400/40 bg-brand-cyan-500/20 text-brand-cyan-300"
          : variant === "purple"
            ? "border border-border-subtle text-muted-foreground hover:border-brand-purple-400/50 hover:text-foreground"
            : "border border-border-subtle text-muted-foreground hover:border-brand-cyan-400/30 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function FilterScrollRow({
  children,
  label,
  className,
}: {
  children: ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {label ? (
        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
      ) : null}
      <div className="w-full">
        <div className="scrollbar-hide overflow-x-auto overscroll-x-contain py-1.5 [-webkit-overflow-scrolling:touch]">
          <div
            role="group"
            aria-label={label}
            className="flex w-max min-w-full items-center justify-center gap-2 px-0.5"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoGridItem({
  photo,
  onSelect,
}: {
  photo: GalleryPhoto;
  onSelect: (photo: GalleryPhoto) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(photo)}
      className="group glass-panel w-full overflow-hidden rounded-2xl text-left transition-all hover:border-brand-purple-400/30 hover:opacity-95 hover:ring-1 hover:ring-brand-purple-400/20"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={photo.imageUrl}
          alt={getGalleryPhotoLabel(photo)}
          fill
          className="object-cover transition-opacity duration-300 group-hover:opacity-90"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-base/80 via-transparent to-transparent" />
        {photo.carName && (
          <div className="absolute right-3 bottom-3 left-3 flex items-end justify-between gap-3">
            <p className="font-semibold text-white">{photo.carName}</p>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize backdrop-blur-sm",
                photo.photoType === "before"
                  ? "bg-white/15 text-white/90"
                  : "bg-brand-cyan-600/90 text-white",
              )}
            >
              {photo.photoType}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}

function GalleryPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const visiblePages = getVisiblePageNumbers(currentPage, totalPages);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Gallery pagination"
      className="mt-10 flex flex-col items-center gap-3"
    >
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center gap-1 rounded-full border border-border-subtle px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-brand-purple-400/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>

        {visiblePages.map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 text-sm text-muted-foreground"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
              onClick={() => onPageChange(page)}
              className={cn(
                "min-w-9 rounded-full px-3 py-1.5 text-sm transition-colors",
                page === currentPage
                  ? "bg-brand-purple-600 text-white"
                  : "border border-border-subtle text-muted-foreground hover:border-brand-purple-400/50 hover:text-foreground",
              )}
            >
              {page}
            </button>
          ),
        )}

        <button
          type="button"
          aria-label="Next page"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex items-center gap-1 rounded-full border border-border-subtle px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-brand-purple-400/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}

export function GalleryPageContent({
  photos,
  filteredCount,
  carNames,
  filters,
  totalPages,
  currentPage,
  hero,
}: GalleryPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gallerySectionRef = useRef<HTMLElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxPhotos, setLightboxPhotos] = useState<GalleryPhoto[]>([]);
  const [comparisonPhotos, setComparisonPhotos] = useState<GalleryPhoto[]>([]);
  const [lightboxLoading, setLightboxLoading] = useState(false);

  const navigate = useCallback(
    (updates: Record<string, string | undefined>) => {
      router.push(buildGalleryUrl(searchParams, updates), { scroll: false });
    },
    [router, searchParams],
  );

  const openPhoto = async (photo: GalleryPhoto) => {
    setLightboxOpen(true);
    setLightboxLoading(true);

    try {
      const params = Object.fromEntries(searchParams.entries());
      const data = await getGalleryLightboxData(params);
      const index = data.filteredPhotos.findIndex((item) => item.id === photo.id);

      if (data.filteredPhotos.length === 0) {
        setLightboxOpen(false);
        return;
      }

      setLightboxPhotos(data.filteredPhotos);
      setComparisonPhotos(data.comparisonPhotos);
      setLightboxIndex(index >= 0 ? index : 0);
    } catch {
      setLightboxOpen(false);
    } finally {
      setLightboxLoading(false);
    }
  };

  const handleCategoryChange = (nextCategory: GalleryCategory) => {
    navigate({
      category: nextCategory === "all" ? undefined : nextCategory,
      car: undefined,
      type: undefined,
      page: undefined,
    });
  };

  const handlePageChange = (page: number) => {
    navigate({ page: page <= 1 ? undefined : String(page) });
    gallerySectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const photoTypeOptions: { id: GalleryPhotoTypeFilter; label: string }[] = [
    { id: "all", label: "All Photos" },
    { id: "before", label: "Before" },
    { id: "after", label: "After" },
  ];

  return (
    <>
      <section ref={gallerySectionRef} className="section-padding pt-32">
        <div className="container-narrow">
          <FadeIn>
            <SectionHeading
              eyebrow={hero.eyebrow}
              title={hero.title}
              description={hero.description}
            />
          </FadeIn>

          <FadeIn delay={0.1}>
            <FilterScrollRow className="mb-6">
              {galleryCategories.map((cat) => (
                <FilterPill
                  key={cat.id}
                  active={filters.category === cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.label}
                </FilterPill>
              ))}
            </FilterScrollRow>

            {carNames.length > 0 && (
              <FilterScrollRow label="Vehicle" className="mb-6">
                <FilterPill
                  active={filters.selectedCar === "all"}
                  onClick={() => navigate({ car: undefined, page: undefined })}
                  variant="cyan"
                  size="sm"
                >
                  All
                </FilterPill>
                {carNames.map((carName) => (
                  <FilterPill
                    key={carName}
                    active={filters.selectedCar === carName}
                    onClick={() =>
                      navigate({ car: carName, page: undefined })
                    }
                    variant="cyan"
                    size="sm"
                  >
                    {carName}
                  </FilterPill>
                ))}
              </FilterScrollRow>
            )}

            <FilterScrollRow label="View" className="mb-10">
              {photoTypeOptions.map((option) => (
                <FilterPill
                  key={option.id}
                  active={filters.photoTypeFilter === option.id}
                  onClick={() =>
                    navigate({
                      type: option.id === "all" ? undefined : option.id,
                      page: undefined,
                    })
                  }
                  variant="cyan"
                  size="sm"
                >
                  {option.label}
                </FilterPill>
              ))}
            </FilterScrollRow>
          </FadeIn>

          {filteredCount === 0 ? (
            <FadeIn>
              <p className="text-center text-muted-foreground">
                No projects in this category yet. Try another filter or check back soon.
              </p>
            </FadeIn>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {photos.map((photo) => (
                  <PhotoGridItem key={photo.id} photo={photo} onSelect={openPhoto} />
                ))}
              </div>

              {filteredCount > GALLERY_PAGE_SIZE && (
                <GalleryPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </section>

      {lightboxOpen && !lightboxLoading && lightboxPhotos.length > 0 && (
        <GalleryLightbox
          photos={lightboxPhotos}
          comparisonPhotos={comparisonPhotos}
          photoTypeFilter={filters.photoTypeFilter}
          index={lightboxIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          onIndexChange={setLightboxIndex}
        />
      )}
    </>
  );
}

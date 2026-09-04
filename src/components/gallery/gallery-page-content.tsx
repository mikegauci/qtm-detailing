"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  galleryCategories,
  getGalleryPhotoLabel,
} from "@/lib/content/gallery-categories";
import {
  clampLightboxIndex,
  filterPhotosByType,
  getGalleryPageCount,
  getVisiblePageNumbers,
  GALLERY_PAGE_SIZE,
  paginatePhotos,
  sortPhotosForDisplay,
  type GalleryPhotoTypeFilter,
} from "@/lib/content/gallery-photo-utils";
import type { GalleryCategory, GalleryPhoto } from "@/types/content";
import type { CtaBandContent, SectionHeadingContent } from "@/types/page-sections";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn, StaggerItem } from "@/components/motion/fade-in";
import { cn } from "@/lib/utils";
import { CtaBand } from "@/components/sections/cta-band";
import { GalleryLightbox } from "@/components/gallery/gallery-lightbox";

type GalleryPageContentProps = {
  photos: GalleryPhoto[];
  cta: CtaBandContent;
  hero: SectionHeadingContent;
};

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
        "rounded-full transition-colors",
        size === "md" ? "px-4 py-2 text-sm font-medium" : "px-3 py-1.5 text-sm",
        active
          ? variant === "purple"
            ? "bg-brand-purple-600 text-white"
            : "bg-brand-cyan-500/20 text-brand-cyan-300 ring-1 ring-brand-cyan-400/40"
          : variant === "purple"
            ? "border border-border-subtle text-muted-foreground hover:border-brand-purple-400/50 hover:text-foreground"
            : "border border-border-subtle text-muted-foreground hover:border-brand-cyan-400/30 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function PhotoGrid({
  items,
  filterKey,
  onSelect,
}: {
  items: GalleryPhoto[];
  filterKey: string;
  onSelect: (photo: GalleryPhoto) => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((photo) => (
          <PhotoGridItem key={photo.id} photo={photo} onSelect={onSelect} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      key={filterKey}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
    >
      {items.map((photo) => (
        <PhotoGridItem key={photo.id} photo={photo} onSelect={onSelect} animated />
      ))}
    </motion.div>
  );
}

function PhotoGridItem({
  photo,
  onSelect,
  animated = false,
}: {
  photo: GalleryPhoto;
  onSelect: (photo: GalleryPhoto) => void;
  animated?: boolean;
}) {
  const content = (
    <button
      type="button"
      onClick={() => onSelect(photo)}
      className="group glass-panel w-full overflow-hidden rounded-2xl text-left transition-all hover:border-brand-purple-400/30 hover:glow-purple"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={photo.imageUrl}
          alt={getGalleryPhotoLabel(photo)}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
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

  if (!animated) {
    return content;
  }

  return <StaggerItem>{content}</StaggerItem>;
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
  const visiblePages = useMemo(
    () => getVisiblePageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  );

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
  cta,
  hero,
}: GalleryPageContentProps) {
  const [category, setCategory] = useState<GalleryCategory>("all");
  const [selectedCar, setSelectedCar] = useState("all");
  const [photoTypeFilter, setPhotoTypeFilter] =
    useState<GalleryPhotoTypeFilter>("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const gallerySectionRef = useRef<HTMLElement>(null);

  const categoryPhotos = useMemo(
    () =>
      category === "all"
        ? photos
        : photos.filter((photo) => photo.category === category),
    [photos, category],
  );

  const carNames = useMemo(
    () =>
      Array.from(
        new Set(categoryPhotos.map((photo) => photo.carName).filter(Boolean)),
      ).sort() as string[],
    [categoryPhotos],
  );

  const filteredPhotos = useMemo(() => {
    const byCar =
      selectedCar === "all"
        ? categoryPhotos
        : categoryPhotos.filter((photo) => photo.carName === selectedCar);

    return sortPhotosForDisplay(
      filterPhotosByType(byCar, photoTypeFilter),
    );
  }, [categoryPhotos, selectedCar, photoTypeFilter]);

  const totalPages = getGalleryPageCount(filteredPhotos.length);

  const paginatedPhotos = useMemo(
    () => paginatePhotos(filteredPhotos, currentPage),
    [filteredPhotos, currentPage],
  );

  const comparisonPhotos = useMemo(() => {
    const byCar =
      selectedCar === "all"
        ? categoryPhotos
        : categoryPhotos.filter((photo) => photo.carName === selectedCar);

    return byCar;
  }, [categoryPhotos, selectedCar]);

  useEffect(() => {
    if (selectedCar !== "all" && !carNames.includes(selectedCar)) {
      setSelectedCar("all");
    }
  }, [carNames, selectedCar]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, selectedCar, photoTypeFilter]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (lightboxOpen && filteredPhotos.length === 0) {
      setLightboxOpen(false);
      return;
    }

    setLightboxIndex((current) =>
      clampLightboxIndex(current, filteredPhotos.length),
    );
  }, [filteredPhotos.length, lightboxOpen]);

  const openPhoto = (photo: GalleryPhoto) => {
    const index = filteredPhotos.findIndex((item) => item.id === photo.id);
    setLightboxIndex(index >= 0 ? index : 0);
    setLightboxOpen(true);
  };

  const handleCategoryChange = (nextCategory: GalleryCategory) => {
    setCategory(nextCategory);
    setSelectedCar("all");
    setPhotoTypeFilter("all");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {galleryCategories.map((cat) => (
                <FilterPill
                  key={cat.id}
                  active={category === cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.label}
                </FilterPill>
              ))}
            </div>

            {carNames.length > 0 && (
              <div className="mb-6 flex flex-col items-center gap-3">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Vehicle
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <FilterPill
                    active={selectedCar === "all"}
                    onClick={() => setSelectedCar("all")}
                    variant="cyan"
                    size="sm"
                  >
                    All
                  </FilterPill>
                  {carNames.map((carName) => (
                    <FilterPill
                      key={carName}
                      active={selectedCar === carName}
                      onClick={() => setSelectedCar(carName)}
                      variant="cyan"
                      size="sm"
                    >
                      {carName}
                    </FilterPill>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-10 flex flex-col items-center gap-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                View
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {photoTypeOptions.map((option) => (
                  <FilterPill
                    key={option.id}
                    active={photoTypeFilter === option.id}
                    onClick={() => setPhotoTypeFilter(option.id)}
                    variant="cyan"
                    size="sm"
                  >
                    {option.label}
                  </FilterPill>
                ))}
              </div>
            </div>
          </FadeIn>

          {filteredPhotos.length === 0 ? (
            <FadeIn>
              <p className="text-center text-muted-foreground">
                No projects in this category yet. Try another filter or check back soon.
              </p>
            </FadeIn>
          ) : (
            <>
              <PhotoGrid
                filterKey={`${category}-${selectedCar}-${photoTypeFilter}-${currentPage}`}
                items={paginatedPhotos}
                onSelect={openPhoto}
              />

              {filteredPhotos.length > GALLERY_PAGE_SIZE && (
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

      <GalleryLightbox
        photos={filteredPhotos}
        comparisonPhotos={comparisonPhotos}
        photoTypeFilter={photoTypeFilter}
        index={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onIndexChange={setLightboxIndex}
      />

      <CtaBand content={cta} />
    </>
  );
}

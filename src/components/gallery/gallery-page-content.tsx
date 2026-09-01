"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { galleryCategories } from "@/lib/content/gallery-categories";
import type { GalleryCategory, GalleryPhoto } from "@/types/content";
import type { CtaBandContent, SectionHeadingContent } from "@/types/page-sections";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/motion/fade-in";
import { cn } from "@/lib/utils";
import { CtaBand } from "@/components/sections/cta-band";
import { GalleryLightbox } from "@/components/gallery/gallery-lightbox";

type GalleryPageContentProps = {
  photos: GalleryPhoto[];
  cta: CtaBandContent;
  hero: SectionHeadingContent;
};

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
          alt={photo.carName ?? "Gallery photo"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-base/80 via-transparent to-transparent" />
        {photo.carName && (
          <div className="absolute right-3 bottom-3 left-3">
            <p className="font-semibold text-white">{photo.carName}</p>
            <p className="text-xs text-white/70 capitalize">{photo.photoType}</p>
          </div>
        )}
      </div>
    </button>
  );

  if (!animated) {
    return content;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
        },
      }}
    >
      {content}
    </motion.div>
  );
}

export function GalleryPageContent({
  photos,
  cta,
  hero,
}: GalleryPageContentProps) {
  const [category, setCategory] = useState<GalleryCategory>("all");
  const [selectedCar, setSelectedCar] = useState("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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
    if (selectedCar === "all") {
      return categoryPhotos;
    }

    return categoryPhotos.filter((photo) => photo.carName === selectedCar);
  }, [categoryPhotos, selectedCar]);

  useEffect(() => {
    if (selectedCar !== "all" && !carNames.includes(selectedCar)) {
      setSelectedCar("all");
    }
  }, [carNames, selectedCar]);

  const openPhoto = (photo: GalleryPhoto) => {
    const index = filteredPhotos.findIndex((item) => item.id === photo.id);
    setLightboxIndex(index >= 0 ? index : 0);
    setLightboxOpen(true);
  };

  const handleCategoryChange = (nextCategory: GalleryCategory) => {
    setCategory(nextCategory);
    setSelectedCar("all");
  };

  return (
    <>
      <section className="section-padding pt-32">
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
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={category === cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    category === cat.id
                      ? "bg-brand-purple-600 text-white"
                      : "border border-border-subtle text-muted-foreground hover:border-brand-purple-400/50 hover:text-foreground",
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {carNames.length > 0 && (
              <div className="mb-10 flex flex-col items-center gap-3">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Vehicle
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    aria-pressed={selectedCar === "all"}
                    onClick={() => setSelectedCar("all")}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm transition-colors",
                      selectedCar === "all"
                        ? "bg-brand-cyan-500/20 text-brand-cyan-300 ring-1 ring-brand-cyan-400/40"
                        : "border border-border-subtle text-muted-foreground hover:border-brand-cyan-400/30 hover:text-foreground",
                    )}
                  >
                    All
                  </button>
                  {carNames.map((carName) => (
                    <button
                      key={carName}
                      type="button"
                      aria-pressed={selectedCar === carName}
                      onClick={() => setSelectedCar(carName)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-sm transition-colors",
                        selectedCar === carName
                          ? "bg-brand-cyan-500/20 text-brand-cyan-300 ring-1 ring-brand-cyan-400/40"
                          : "border border-border-subtle text-muted-foreground hover:border-brand-cyan-400/30 hover:text-foreground",
                      )}
                    >
                      {carName}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </FadeIn>

          {filteredPhotos.length === 0 ? (
            <FadeIn>
              <p className="text-center text-muted-foreground">
                No projects in this category yet. Try another filter or check back soon.
              </p>
            </FadeIn>
          ) : (
            <PhotoGrid
              filterKey={`${category}-${selectedCar}`}
              items={filteredPhotos}
              onSelect={openPhoto}
            />
          )}
        </div>
      </section>

      <GalleryLightbox
        photos={filteredPhotos}
        index={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onIndexChange={setLightboxIndex}
      />

      <CtaBand content={cta} />
    </>
  );
}

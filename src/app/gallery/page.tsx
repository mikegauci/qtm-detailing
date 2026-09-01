"use client";

import { useState } from "react";
import Image from "next/image";
import {
  galleryItems,
  galleryCategories,
  type GalleryCategory,
} from "@/content/gallery";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/fade-in";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BeforeAfterSlider } from "@/components/gallery/before-after-slider";
import { CtaBand } from "@/components/sections/cta-band";

const DIALOG_CLOSE_MS = 200;

export default function GalleryPage() {
  const [category, setCategory] = useState<GalleryCategory>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered =
    category === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.category === category);

  const selectedItem = galleryItems.find((item) => item.id === selectedId);

  const openItem = (id: string) => {
    setSelectedId(id);
    setDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      window.setTimeout(() => setSelectedId(null), DIALOG_CLOSE_MS);
    }
  };

  return (
    <>
      <section className="section-padding pt-32">
        <div className="container-narrow">
          <FadeIn>
            <SectionHeading
              eyebrow="Gallery"
              title="Our latest work"
              description="Real transformations straight from our studio. Click any project to view before and after."
            />
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="mb-10 flex flex-wrap justify-center gap-2">
              {galleryCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={category === cat.id}
                  onClick={() => setCategory(cat.id)}
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
          </FadeIn>

          {filtered.length === 0 ? (
            <FadeIn>
              <p className="text-center text-muted-foreground">
                No projects in this category yet. Try another filter or check back soon.
              </p>
            </FadeIn>
          ) : (
            <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <StaggerItem key={item.id}>
                  <button
                    type="button"
                    onClick={() => openItem(item.id)}
                    className="group glass-panel w-full overflow-hidden rounded-2xl text-left transition-all hover:border-brand-purple-400/30 hover:glow-purple"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={item.afterImage}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-base/80 via-transparent to-transparent" />
                      <div className="absolute right-3 bottom-3 left-3">
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="text-xs text-white/70">{item.description}</p>
                      </div>
                    </div>
                  </button>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="glass-panel max-w-4xl border-border-subtle bg-surface-base p-0">
          {selectedItem && (
            <>
              <DialogHeader className="p-6 pb-0">
                <DialogTitle>{selectedItem.title}</DialogTitle>
                <DialogDescription>{selectedItem.description}</DialogDescription>
              </DialogHeader>
              <div className="p-6 pt-4">
                <BeforeAfterSlider
                  key={selectedItem.id}
                  beforeImage={selectedItem.beforeImage}
                  afterImage={selectedItem.afterImage}
                  title={selectedItem.title}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <CtaBand />
    </>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { galleryItems } from "@/content/gallery";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/motion/fade-in";
import { cn } from "@/lib/utils";

export function BeforeAfterShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const item = galleryItems[activeIndex];

  return (
    <section className="section-padding">
      <div className="container-narrow">
        <FadeIn>
          <SectionHeading
            eyebrow="Results"
            title="See the transformation"
            description="Drag the slider to compare before and after. Real results from our Birkirkara studio."
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="glass-panel overflow-hidden rounded-2xl">
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={item.afterImage}
                alt={`${item.title} - after`}
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
              <div
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: "50%" }}
              >
                <div className="relative h-full w-[200%] max-w-none">
                  <Image
                    src={item.beforeImage}
                    alt={`${item.title} - before`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1280px) 100vw, 1280px"
                  />
                </div>
              </div>
              <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white/80 shadow-lg" />
              <div className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                Before
              </div>
              <div className="absolute top-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                After
              </div>
            </div>

            <div className="border-t border-border-subtle p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  {galleryItems.slice(0, 4).map((g, i) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      className={cn(
                        "h-2 w-8 rounded-full transition-colors",
                        i === activeIndex
                          ? "bg-brand-purple-400"
                          : "bg-muted hover:bg-muted-foreground/30",
                      )}
                      aria-label={`View ${g.title}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn className="mt-8 text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-cyan-400 transition-colors hover:text-brand-cyan-300"
          >
            Browse full gallery
            <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}

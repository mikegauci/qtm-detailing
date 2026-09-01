"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { galleryItems } from "@/content/gallery";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/motion/fade-in";
import { BeforeAfterSlider } from "@/components/gallery/before-after-slider";
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
            <BeforeAfterSlider
              key={item.id}
              beforeImage={item.beforeImage}
              afterImage={item.afterImage}
              title={item.title}
              className="rounded-none"
            />

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
                      aria-pressed={i === activeIndex}
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

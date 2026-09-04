"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { serviceImageObjectPosition } from "@/lib/content/service-images";
import type { ServiceImage } from "@/types/content";
import { cn } from "@/lib/utils";

type ServiceImageSliderProps = {
  images: ServiceImage[];
  alt: string;
  className?: string;
};

export function ServiceImageSlider({
  images,
  alt,
  className,
}: ServiceImageSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback(
    (index: number) => {
      if (images.length === 0) return;
      setActiveIndex((index + images.length) % images.length);
    },
    [images.length],
  );

  if (images.length === 0) {
    return (
      <div
        className={cn(
          "relative flex aspect-[16/10] items-center justify-center bg-surface-raised/50 lg:aspect-auto lg:min-h-[320px]",
          className,
        )}
      >
        <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
      </div>
    );
  }

  const activeImage = images[activeIndex] ?? images[0];
  const hasMultiple = images.length > 1;

  return (
    <div
      className={cn(
        "group relative aspect-[16/10] lg:aspect-auto lg:min-h-[320px]",
        className,
      )}
    >
      <Image
        key={activeImage.url}
        src={activeImage.url}
        alt={hasMultiple ? `${alt} — photo ${activeIndex + 1}` : alt}
        fill
        className="object-cover transition-opacity duration-300"
        style={{
          objectPosition: serviceImageObjectPosition(activeImage.focalY),
        }}
        sizes="(max-width: 1024px) 100vw, 50vw"
        priority={activeIndex === 0}
      />

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-100 backdrop-blur-sm transition-opacity hover:bg-black/70 lg:opacity-0 lg:group-hover:opacity-100"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-100 backdrop-blur-sm transition-opacity hover:bg-black/70 lg:opacity-0 lg:group-hover:opacity-100"
            aria-label="Next photo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
            {images.map((image, index) => (
              <button
                key={image.url}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === activeIndex
                    ? "w-5 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/75",
                )}
                aria-label={`Go to photo ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

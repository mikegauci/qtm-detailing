"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { serviceImageObjectPosition } from "@/lib/content/service-images";
import type { ServiceImage } from "@/types/content";
import { cn } from "@/lib/utils";

type ServiceImageSliderProps = {
  images: ServiceImage[];
  alt: string;
  className?: string;
};

const SWIPE_OFFSET_THRESHOLD = 48;
const SWIPE_VELOCITY_THRESHOLD = 400;

const slideTransition = {
  duration: 0.4,
  ease: [0.21, 0.47, 0.32, 0.98] as const,
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0.85,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0.85,
  }),
};

export function ServiceImageSlider({
  images,
  alt,
  className,
}: ServiceImageSliderProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = useCallback(
    (step: number) => {
      if (images.length <= 1) return;
      setDirection(step);
      setActiveIndex(
        (prev) => (prev + step + images.length) % images.length,
      );
    },
    [images.length],
  );

  const goToIndex = useCallback(
    (index: number) => {
      if (images.length <= 1 || index === activeIndex) return;

      let diff = index - activeIndex;
      if (diff > images.length / 2) diff -= images.length;
      if (diff < -images.length / 2) diff += images.length;

      setDirection(diff > 0 ? 1 : -1);
      setActiveIndex(index);
    },
    [activeIndex, images.length],
  );

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const { x: offsetX } = info.offset;
      const { x: velocityX } = info.velocity;

      if (
        offsetX < -SWIPE_OFFSET_THRESHOLD ||
        velocityX < -SWIPE_VELOCITY_THRESHOLD
      ) {
        paginate(1);
        return;
      }

      if (
        offsetX > SWIPE_OFFSET_THRESHOLD ||
        velocityX > SWIPE_VELOCITY_THRESHOLD
      ) {
        paginate(-1);
      }
    },
    [paginate],
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
        "group relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[320px]",
        className,
      )}
    >
      {shouldReduceMotion ? (
        <Image
          src={activeImage.url}
          alt={hasMultiple ? `${alt} — photo ${activeIndex + 1}` : alt}
          fill
          className="object-cover"
          style={{
            objectPosition: serviceImageObjectPosition(activeImage.focalY),
          }}
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={activeIndex === 0}
        />
      ) : (
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            drag={hasMultiple ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 touch-pan-y"
          >
            <Image
              src={activeImage.url}
              alt={hasMultiple ? `${alt} — photo ${activeIndex + 1}` : alt}
              fill
              draggable={false}
              className="pointer-events-none object-cover select-none"
              style={{
                objectPosition: serviceImageObjectPosition(activeImage.focalY),
              }}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={activeIndex === 0}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={() => paginate(-1)}
            className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-100 backdrop-blur-sm transition-opacity hover:bg-black/70 lg:opacity-0 lg:group-hover:opacity-100"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => paginate(1)}
            className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-100 backdrop-blur-sm transition-opacity hover:bg-black/70 lg:opacity-0 lg:group-hover:opacity-100"
            aria-label="Next photo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-1.5">
            {images.map((image, index) => (
              <button
                key={image.url}
                type="button"
                onClick={() => goToIndex(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === activeIndex
                    ? "w-5 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/75",
                )}
                aria-label={`Go to photo ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

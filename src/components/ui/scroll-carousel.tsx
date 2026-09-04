"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ScrollCarouselProps = {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
};

export function ScrollCarousel({
  children,
  className,
  itemClassName,
}: ScrollCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    updateScrollState();

    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const item = el.querySelector<HTMLElement>("[data-carousel-item]");
    const gap = 16;
    const distance = (item?.offsetWidth ?? 300) + gap;

    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  return (
    <div className={cn("group/carousel relative", className)}>
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="absolute top-1/2 left-2 z-10 hidden -translate-y-1/2 rounded-full border border-border-subtle bg-surface-raised/90 p-2 text-foreground opacity-0 shadow-lg backdrop-blur-sm transition-opacity group-hover/carousel:opacity-100 md:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="absolute top-1/2 right-2 z-10 hidden -translate-y-1/2 rounded-full border border-border-subtle bg-surface-raised/90 p-2 text-foreground opacity-0 shadow-lg backdrop-blur-sm transition-opacity group-hover/carousel:opacity-100 md:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-2 [-webkit-overflow-scrolling:touch]"
      >
        {Children.toArray(children).map((child, index) => (
          <div
            key={index}
            data-carousel-item
            className={cn("shrink-0 snap-start", itemClassName)}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
};

const hiddenDirectionClasses = {
  up: "translate-y-6",
  down: "-translate-y-6",
  left: "translate-x-6",
  right: "-translate-x-6",
  none: "",
};

export function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-80px", threshold: 0 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-600 ease-[cubic-bezier(0.21,0.47,0.32,0.98)]",
        visible
          ? "translate-x-0 translate-y-0 opacity-100"
          : cn("opacity-0", hiddenDirectionClasses[direction]),
        className,
      )}
      style={{ transitionDelay: visible ? `${delay}s` : undefined }}
    >
      {children}
    </div>
  );
}

type StaggerContainerProps = {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
};

const StaggerIndexContext = createContext(0);

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-80px", threshold: 0 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "stagger-container",
        visible && "stagger-visible",
        className,
      )}
      style={{ ["--stagger-delay" as string]: `${staggerDelay}s` }}
    >
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) {
          return child;
        }

        return (
          <StaggerIndexContext.Provider key={child.key ?? index} value={index}>
            {child}
          </StaggerIndexContext.Provider>
        );
      })}
    </div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const index = useContext(StaggerIndexContext);

  return (
    <div
      className={cn("stagger-item", className)}
      style={{ ["--stagger-index" as string]: index }}
    >
      {children}
    </div>
  );
}

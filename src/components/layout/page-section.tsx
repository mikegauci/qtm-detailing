import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type PageSectionProps = ComponentProps<"section"> & {
  raised?: boolean;
  narrow?: boolean;
  container?: boolean;
  containerClassName?: string;
  internal?: boolean;
};

export function PageSection({
  raised,
  narrow,
  container = true,
  containerClassName,
  internal,
  className,
  children,
  ...props
}: PageSectionProps) {
  return (
    <section
      className={cn(
        internal ? "internal-page-padding" : "section-padding",
        raised && "bg-surface-raised/30",
        className,
      )}
      {...props}
    >
      {container ? (
        <div
          className={cn(
            "container-narrow",
            narrow && "max-w-3xl",
            containerClassName,
          )}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}

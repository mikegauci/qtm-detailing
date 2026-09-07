import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type InternalPageSectionProps = ComponentProps<"section">;

export function InternalPageSection({
  className,
  children,
  ...props
}: InternalPageSectionProps) {
  return (
    <section
      className={cn("section-padding pt-40 md:pt-32", className)}
      {...props}
    >
      {children}
    </section>
  );
}

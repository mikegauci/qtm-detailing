import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectionCheckBadgeProps = {
  selected: boolean;
  size?: "sm" | "md";
  className?: string;
};

export function SelectionCheckBadge({
  selected,
  size = "md",
  className,
}: SelectionCheckBadgeProps) {
  if (!selected) return null;

  return (
    <span
      className={cn(
        "absolute flex items-center justify-center rounded-full bg-brand-purple-500 text-white",
        size === "sm"
          ? "top-1.5 right-1.5 h-5 w-5 sm:top-2 sm:right-2 sm:h-6 sm:w-6"
          : "right-2 top-2 h-6 w-6 bg-brand-purple-600 shadow-md",
        className,
      )}
    >
      <Check
        className={size === "sm" ? "h-3 w-3 sm:h-4 sm:w-4" : "h-3.5 w-3.5"}
      />
    </span>
  );
}

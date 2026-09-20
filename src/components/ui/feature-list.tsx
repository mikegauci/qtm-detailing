import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type FeatureListProps = {
  included?: string[];
  excluded?: string[];
  className?: string;
  includedIconClassName?: string;
};

export function FeatureList({
  included = [],
  excluded = [],
  className,
  includedIconClassName = "text-brand-purple-400",
}: FeatureListProps) {
  if (included.length === 0 && excluded.length === 0) {
    return null;
  }

  return (
    <ul className={cn("space-y-2", className)}>
      {included.map((feature) => (
        <li
          key={`included-${feature}`}
          className="flex items-start gap-2 text-sm text-muted-foreground"
        >
          <Check
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0",
              includedIconClassName,
            )}
          />
          {feature}
        </li>
      ))}
      {excluded.map((feature) => (
        <li
          key={`excluded-${feature}`}
          className="flex items-start gap-2 text-sm text-muted-foreground/70"
        >
          <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          {feature}
        </li>
      ))}
    </ul>
  );
}

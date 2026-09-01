import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "outline" | "success" | "warning" | "destructive";
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "border-white/10 bg-white/10 text-white",
        variant === "outline" && "border-white/20 bg-transparent text-white/80",
        variant === "success" && "border-emerald-500/30 bg-emerald-500/20 text-emerald-300",
        variant === "warning" && "border-amber-500/30 bg-amber-500/20 text-amber-300",
        variant === "destructive" && "border-red-500/30 bg-red-500/20 text-red-300",
        className,
      )}
      {...props}
    />
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminPageHeaderProps = {
  backHref: string;
  title: string;
  backLabel?: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function AdminPageHeader({
  backHref,
  title,
  backLabel = "Back",
  subtitle,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-white sm:text-2xl">{title}</h1>
          {subtitle ? (
            <p className="text-sm text-white/60">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-3 sm:shrink-0">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

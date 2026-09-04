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
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle ? (
            <p className="text-sm text-white/60">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {actions}
    </div>
  );
}

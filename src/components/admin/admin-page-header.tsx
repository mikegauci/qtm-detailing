import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminPageHeaderProps = {
  backHref: string;
  title: string;
  backLabel?: string;
};

export function AdminPageHeader({
  backHref,
  title,
  backLabel = "Back",
}: AdminPageHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Button asChild variant="ghost" size="sm">
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </Button>
      <h1 className="text-2xl font-bold text-white">{title}</h1>
    </div>
  );
}

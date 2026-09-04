"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SaveSectionButtonProps = {
  label: string;
  isSaving: boolean;
  onClick: () => void;
  className?: string;
};

export function SaveSectionButton({
  label,
  isSaving,
  onClick,
  className,
}: SaveSectionButtonProps) {
  return (
    <div className={cn("flex justify-end", className)}>
      <Button onClick={onClick} disabled={isSaving}>
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : label}
      </Button>
    </div>
  );
}

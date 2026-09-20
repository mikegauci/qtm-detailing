"use client";

import { SubmitButton } from "@/components/ui/submit-button";
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
      <SubmitButton
        type="button"
        onClick={onClick}
        isPending={isSaving}
        label={label}
      />
    </div>
  );
}

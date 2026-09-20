"use client";

import type { ComponentProps } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type SubmitButtonProps = ComponentProps<typeof Button> & {
  isPending?: boolean;
  label: string;
  pendingLabel?: string;
};

export function SubmitButton({
  isPending = false,
  label,
  pendingLabel,
  disabled,
  children,
  ...props
}: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={disabled ?? isPending} {...props}>
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {pendingLabel ?? label}
        </>
      ) : (
        (children ?? label)
      )}
    </Button>
  );
}

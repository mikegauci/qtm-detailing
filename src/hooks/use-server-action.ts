"use client";

import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ActionResult } from "@/types/action-result";

type RunOptions = {
  onSuccess?: () => void;
  refresh?: boolean;
};

export function useServerAction(defaultOptions?: RunOptions) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = useCallback(
    <T extends ActionResult>(action: () => Promise<T>, options?: RunOptions) => {
      startTransition(async () => {
        const result = await action();
        const merged = { ...defaultOptions, ...options };

        if (result.success) {
          toast.success(result.message);
          merged.onSuccess?.();
          if (merged.refresh) {
            router.refresh();
          }
        } else {
          toast.error(result.message);
        }
      });
    },
    [defaultOptions, router],
  );

  return { run, isPending, startTransition };
}

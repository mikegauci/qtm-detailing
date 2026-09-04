"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCustomer } from "@/app/actions/admin/customers";
import { Button } from "@/components/ui/button";

type DeleteCustomerButtonProps = {
  customerId: string;
  customerName: string;
  bookingCount?: number;
  vehicleCount?: number;
  redirectTo?: string;
  size?: "default" | "sm" | "icon-sm";
  variant?: "destructive" | "ghost";
  showLabel?: boolean;
};

export function DeleteCustomerButton({
  customerId,
  customerName,
  bookingCount = 0,
  vehicleCount = 0,
  redirectTo,
  size = "default",
  variant = "destructive",
  showLabel = true,
}: DeleteCustomerButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const parts = [`Permanently delete ${customerName}?`];
    const related: string[] = [];

    if (bookingCount) {
      related.push(
        `${bookingCount} booking${bookingCount !== 1 ? "s" : ""}`,
      );
    }
    if (vehicleCount) {
      related.push(`${vehicleCount} vehicle${vehicleCount !== 1 ? "s" : ""}`);
    }

    if (related.length) {
      parts.push(`This will also remove ${related.join(" and ")}.`);
    }

    parts.push("This cannot be undone.");

    if (!confirm(parts.join("\n\n"))) return;

    startTransition(async () => {
      const result = await deleteCustomer(customerId);
      if (result.success) {
        toast.success(result.message);
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.refresh();
        }
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Trash2 className="h-4 w-4" />
          {showLabel && size !== "icon-sm" ? "Delete customer" : null}
        </>
      )}
    </Button>
  );
}

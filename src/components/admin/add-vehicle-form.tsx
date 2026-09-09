"use client";

import { useRef, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createVehicle } from "@/app/actions/admin/customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AddVehicleFormProps = {
  customerId: string;
  idPrefix?: string;
  submitLabel?: string;
  onSuccess: (result: { id: string; label: string }) => void | Promise<void>;
  onCancel?: () => void;
  className?: string;
};

export function AddVehicleForm({
  customerId,
  idPrefix = "vehicle",
  submitLabel = "Save vehicle",
  onSuccess,
  onCancel,
  className,
}: AddVehicleFormProps) {
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  function handleSubmit() {
    const container = containerRef.current;
    if (!container) return;

    const vehicle = (
      container.querySelector('[name="vehicle"]') as HTMLInputElement
    ).value.trim();

    if (!vehicle) {
      toast.error("Vehicle is required.");
      return;
    }

    startTransition(async () => {
      const result = await createVehicle({
        customer_id: customerId,
        make: vehicle,
      });

      if (!result.success || !result.id) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      await onSuccess({ id: result.id, label: vehicle });
    });
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "space-y-4 rounded-xl border border-white/10 p-4",
        className,
      )}
    >
      <div className="space-y-1">
        <Label htmlFor={`${idPrefix}_vehicle`}>Vehicle</Label>
        <Input
          id={`${idPrefix}_vehicle`}
          name="vehicle"
          placeholder="e.g. Ferrari F40"
          required
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          disabled={isPending}
          onClick={handleSubmit}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

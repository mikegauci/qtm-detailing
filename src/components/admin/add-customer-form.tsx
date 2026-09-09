"use client";

import { useRef, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createCustomer,
  createVehicle,
  deleteCustomer,
} from "@/app/actions/admin/customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AddCustomerFormProps = {
  idPrefix?: string;
  submitLabel?: string;
  onSuccess: (result: { id: string; vehicleId: string }) => void | Promise<void>;
  onCancel?: () => void;
  className?: string;
};

export function AddCustomerForm({
  idPrefix = "customer",
  submitLabel = "Save customer",
  onSuccess,
  onCancel,
  className,
}: AddCustomerFormProps) {
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  function handleSubmit() {
    const container = containerRef.current;
    if (!container) return;

    const fullName = (
      container.querySelector('[name="full_name"]') as HTMLInputElement
    ).value.trim();
    const email = (
      container.querySelector('[name="email"]') as HTMLInputElement
    ).value.trim();
    const phone = (
      container.querySelector('[name="phone"]') as HTMLInputElement
    ).value.trim();
    const vehicle = (
      container.querySelector('[name="vehicle"]') as HTMLInputElement
    ).value.trim();

    if (!vehicle) {
      toast.error("Vehicle is required.");
      return;
    }

    startTransition(async () => {
      const result = await createCustomer({
        full_name: fullName,
        email: email || null,
        phone: phone || null,
      });

      if (!result.success || !result.id) {
        toast.error(result.message);
        return;
      }

      const vehicleResult = await createVehicle({
        customer_id: result.id,
        make: vehicle,
      });

      if (!vehicleResult.success || !vehicleResult.id) {
        await deleteCustomer(result.id);
        toast.error(vehicleResult.message ?? "Failed to add vehicle.");
        return;
      }

      toast.success(result.message);
      await onSuccess({ id: result.id, vehicleId: vehicleResult.id });
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
      <p className="text-sm font-medium text-white">Add a customer manually</p>
      <p className="text-xs text-white/50">
        Phone or email required. Leave email blank if they prefer phone contact
        only.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}_full_name`}>Full name</Label>
          <Input
            id={`${idPrefix}_full_name`}
            name="full_name"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}_email`}>Email (optional)</Label>
          <Input
            id={`${idPrefix}_email`}
            name="email"
            type="email"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}_phone`}>Phone</Label>
          <Input id={`${idPrefix}_phone`} name="phone" />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}_vehicle`}>Vehicle</Label>
          <Input
            id={`${idPrefix}_vehicle`}
            name="vehicle"
            placeholder="e.g. Ferrari F40"
            required
          />
        </div>
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
              Adding...
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

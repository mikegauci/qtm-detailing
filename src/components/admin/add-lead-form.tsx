"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createLead } from "@/app/actions/admin/leads";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  LEAD_SOURCE_LABELS,
  LEAD_SOURCE_OPTIONS,
} from "@/lib/utils/booking";

type AddLeadFormProps = {
  onSuccess: () => void | Promise<void>;
  onCancel: () => void;
};

export function AddLeadForm({ onSuccess, onCancel }: AddLeadFormProps) {
  const [leadSource, setLeadSource] = useState("word_of_mouth");
  const [isPending, startTransition] = useTransition();

  function handleCreateLead(formData: FormData) {
    startTransition(async () => {
      const result = await createLead({
        name: formData.get("name") as string,
        email: (formData.get("email") as string) || null,
        phone: (formData.get("phone") as string) || null,
        vehicle: (formData.get("vehicle") as string) || null,
        notes: (formData.get("notes") as string) || null,
        source: leadSource,
      });

      if (result.success) {
        toast.success(result.message);
        await onSuccess();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form
      action={handleCreateLead}
      className="space-y-4 rounded-xl border border-white/10 p-4"
    >
      <p className="text-sm font-medium text-white">
        Add a lead from word of mouth, phone, or other sources
      </p>
      <p className="text-xs text-white/50">
        Phone or email required. Leave email blank if they prefer phone contact
        only.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="lead_name">Name</Label>
          <Input id="lead_name" name="name" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="lead_email">Email (optional)</Label>
          <Input id="lead_email" name="email" type="email" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="lead_phone">Phone</Label>
          <Input id="lead_phone" name="phone" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="lead_vehicle">Vehicle</Label>
          <Input id="lead_vehicle" name="vehicle" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="lead_source">Source</Label>
          <Select value={leadSource} onValueChange={setLeadSource}>
            <SelectTrigger id="lead_source" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_SOURCE_OPTIONS.map((source) => (
                <SelectItem key={source} value={source}>
                  {LEAD_SOURCE_LABELS[source]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="lead_notes">Notes</Label>
          <Textarea id="lead_notes" name="notes" rows={2} />
        </div>
      </div>
      <div className="flex gap-2">
        <SubmitButton
          size="sm"
          isPending={isPending}
          label="Save lead"
          pendingLabel="Adding..."
        />
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

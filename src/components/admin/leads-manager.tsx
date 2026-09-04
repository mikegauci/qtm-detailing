"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Loader2, Plus, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  convertLeadToCustomer,
  createLead,
  deleteLead,
  updateLeadStatus,
} from "@/app/actions/admin/leads";
import type { Tables } from "@/lib/supabase/types";
import {
  LEAD_POTENTIAL_STATUSES,
  LEAD_SOURCE_LABELS,
  LEAD_SOURCE_OPTIONS,
  LEAD_STATUS_LABELS,
} from "@/lib/utils/booking";
import { Badge } from "@/components/ui/badge";
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

type Lead = Tables<"leads">;

const STATUS_OPTIONS = Object.keys(LEAD_STATUS_LABELS);

function getSourceLabel(source: string | null) {
  if (!source) return "—";
  return LEAD_SOURCE_LABELS[source] ?? source;
}

export function LeadsManager({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [showAddLead, setShowAddLead] = useState(false);
  const [leadSource, setLeadSource] = useState("word_of_mouth");
  const [isPending, startTransition] = useTransition();

  const filteredLeads = useMemo(() => {
    if (statusFilter === "all") return leads;
    if (statusFilter === "potential") {
      return leads.filter((lead) =>
        (LEAD_POTENTIAL_STATUSES as readonly string[]).includes(lead.status),
      );
    }
    return leads.filter((lead) => lead.status === statusFilter);
  }, [leads, statusFilter]);

  function handleStatusChange(leadId: string, status: string) {
    setPendingId(leadId);
    startTransition(async () => {
      const result = await updateLeadStatus(
        leadId,
        status as Lead["status"],
      );
      setPendingId(null);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleConvert(leadId: string) {
    setPendingId(leadId);
    startTransition(async () => {
      const result = await convertLeadToCustomer(leadId);
      setPendingId(null);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleDelete(lead: Lead) {
    if (
      !confirm(
        `Permanently delete ${lead.name}?\n\nThis cannot be undone.`,
      )
    ) {
      return;
    }

    setPendingId(lead.id);
    startTransition(async () => {
      const result = await deleteLead(lead.id);
      setPendingId(null);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

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
        setShowAddLead(false);
        setLeadSource("word_of_mouth");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="potential">Potential</SelectItem>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {LEAD_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-3">
          <p className="text-sm text-white/50">
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""}
          </p>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowAddLead(!showAddLead)}
          >
            <Plus className="h-4 w-4" />
            Add lead
          </Button>
        </div>
      </div>

      {showAddLead && (
        <form
          action={handleCreateLead}
          className="space-y-4 rounded-xl border border-white/10 p-4"
        >
          <p className="text-sm font-medium text-white">
            Add a lead from word of mouth, phone, or other sources
          </p>
          <p className="text-xs text-white/50">
            Phone or email required — leave email blank if they prefer phone
            contact only.
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
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Save lead"
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowAddLead(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-left text-white/60">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Vehicle</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-white/5 hover:bg-white/5"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{lead.name}</p>
                  {lead.message && (
                    <p className="mt-0.5 max-w-xs truncate text-xs text-white/40">
                      {lead.message}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="text-white/80">{lead.email ?? "—"}</p>
                  {lead.phone && (
                    <p className="text-xs text-white/50">{lead.phone}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-white/70">
                  {lead.vehicle ?? "—"}
                </td>
                <td className="px-4 py-3 text-white/70">
                  {getSourceLabel(lead.source)}
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={lead.status}
                    onValueChange={(value) => handleStatusChange(lead.id, value)}
                    disabled={isPending && pendingId === lead.id}
                  >
                    <SelectTrigger className="h-8 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {LEAD_STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-white/50">
                  {format(new Date(lead.created_at), "d MMM yyyy")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {lead.status !== "converted" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConvert(lead.id)}
                        disabled={isPending && pendingId === lead.id}
                      >
                        {isPending && pendingId === lead.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4" />
                            Convert
                          </>
                        )}
                      </Button>
                    ) : (
                      <Badge variant="success">Converted</Badge>
                    )}
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleDelete(lead)}
                      disabled={isPending && pendingId === lead.id}
                      aria-label={`Delete ${lead.name}`}
                      className="text-white/50 hover:text-destructive"
                    >
                      {isPending && pendingId === lead.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLeads.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-white/50">
            No leads match this filter. Add one manually or wait for website
            enquiries.
          </p>
        )}
      </div>
    </div>
  );
}

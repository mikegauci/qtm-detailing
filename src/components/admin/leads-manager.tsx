"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDisplayDate } from "@/lib/utils/dates";
import { Loader2, Plus, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  convertLeadToCustomer,
  deleteLead,
  updateLeadStatus,
} from "@/app/actions/admin/leads";
import { AddLeadForm } from "@/components/admin/add-lead-form";
import {
  AdminDataTable,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
} from "@/components/admin/admin-data-table";
import type { Tables } from "@/lib/supabase/types";
import {
  LEAD_POTENTIAL_STATUSES,
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
} from "@/lib/utils/booking";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
        <AddLeadForm
          onSuccess={async () => {
            setShowAddLead(false);
            router.refresh();
          }}
          onCancel={() => setShowAddLead(false)}
        />
      )}

      <AdminDataTable
        isEmpty={filteredLeads.length === 0}
        emptyMessage="No leads match this filter. Add one manually."
      >
        <AdminTableHead>
          <AdminTableHeaderCell>Name</AdminTableHeaderCell>
          <AdminTableHeaderCell>Contact</AdminTableHeaderCell>
          <AdminTableHeaderCell>Vehicle</AdminTableHeaderCell>
          <AdminTableHeaderCell>Source</AdminTableHeaderCell>
          <AdminTableHeaderCell>Status</AdminTableHeaderCell>
          <AdminTableHeaderCell>Date</AdminTableHeaderCell>
          <AdminTableHeaderCell>Actions</AdminTableHeaderCell>
        </AdminTableHead>
        <tbody>
          {filteredLeads.map((lead) => (
            <AdminTableRow key={lead.id}>
              <AdminTableCell>
                <p className="font-medium text-white">{lead.name}</p>
                {lead.message && (
                  <p className="mt-0.5 max-w-xs truncate text-xs text-white/40">
                    {lead.message}
                  </p>
                )}
              </AdminTableCell>
              <AdminTableCell>
                <p className="text-white/80">{lead.email ?? "—"}</p>
                {lead.phone && (
                  <p className="text-xs text-white/50">{lead.phone}</p>
                )}
              </AdminTableCell>
              <AdminTableCell className="text-white/70">
                {lead.vehicle ?? "—"}
              </AdminTableCell>
              <AdminTableCell className="text-white/70">
                {getSourceLabel(lead.source)}
              </AdminTableCell>
              <AdminTableCell>
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
              </AdminTableCell>
              <AdminTableCell className="text-white/50">
                {formatDisplayDate(lead.created_at)}
              </AdminTableCell>
              <AdminTableCell>
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
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </tbody>
      </AdminDataTable>
    </div>
  );
}

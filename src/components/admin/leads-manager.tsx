"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  convertLeadToCustomer,
  updateLeadStatus,
} from "@/app/actions/admin/leads";
import type { Tables } from "@/lib/supabase/types";
import { LEAD_STATUS_LABELS } from "@/lib/utils/booking";
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

export function LeadsManager({ leads }: { leads: Lead[] }) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredLeads = useMemo(() => {
    if (statusFilter === "all") return leads;
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {LEAD_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-white/50">
          {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-left text-white/60">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Vehicle</th>
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
                  <p className="text-white/80">{lead.email}</p>
                  {lead.phone && (
                    <p className="text-xs text-white/50">{lead.phone}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-white/70">
                  {lead.vehicle ?? "—"}
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLeads.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-white/50">
            No leads match this filter.{" "}
            <Link href="/contact" className="text-brand-purple-400 hover:underline">
              Leads come from the contact form
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}

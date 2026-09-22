"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { getRelation } from "@/lib/admin/supabase-relations";
import type { Tables } from "@/lib/supabase/types";
import { formatBookingVehiclesLabel } from "@/lib/utils/booking-vehicles";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  formatBookingDateRange,
} from "@/lib/utils/booking";
import { cn } from "@/lib/utils";
import {
  AdminDataTable,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
} from "@/components/admin/admin-data-table";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Booking = Tables<"bookings"> & {
  customers:
    | Pick<Tables<"customers">, "full_name" | "email" | "phone">
    | Pick<Tables<"customers">, "full_name" | "email" | "phone">[]
    | null;
  booking_vehicles: {
    vehicles:
      | Pick<Tables<"vehicles">, "make" | "model">
      | Pick<Tables<"vehicles">, "make" | "model">[]
      | null;
  }[];
};

const STATUS_OPTIONS = Object.keys(BOOKING_STATUS_LABELS);

export function BookingsManager({ bookings }: { bookings: Booking[] }) {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBookings = useMemo(() => {
    if (statusFilter === "all") return bookings;
    return bookings.filter((booking) => booking.status === statusFilter);
  }, [bookings, statusFilter]);

  const filterLabel =
    statusFilter === "all"
      ? "All statuses"
      : (BOOKING_STATUS_LABELS[statusFilter] ?? statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bookings</h1>
          <p className="mt-1 text-sm text-white/60">
            {filteredBookings.length} booking
            {filteredBookings.length !== 1 ? "s" : ""}
            {statusFilter !== "all" ? ` · ${filterLabel}` : ""}
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/bookings/new">
            <Plus className="h-4 w-4" />
            New booking
          </Link>
        </Button>
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-full sm:w-52">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {STATUS_OPTIONS.map((status) => (
            <SelectItem
              key={status}
              value={status}
              className={cn(
                "my-0.5 rounded-md border font-medium focus:text-inherit",
                BOOKING_STATUS_COLORS[status],
              )}
            >
              {BOOKING_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AdminDataTable
        isEmpty={filteredBookings.length === 0}
        emptyMessage={
          bookings.length === 0 ? (
            <>
              No bookings yet.{" "}
              <Link
                href="/admin/bookings/new"
                className="text-brand-purple-400 hover:underline"
              >
                Create the first one
              </Link>
              .
            </>
          ) : (
            <>No bookings match this status filter.</>
          )
        }
      >
        <AdminTableHead>
          <AdminTableHeaderCell>Code</AdminTableHeaderCell>
          <AdminTableHeaderCell>Customer</AdminTableHeaderCell>
          <AdminTableHeaderCell>Dates</AdminTableHeaderCell>
          <AdminTableHeaderCell className="hidden md:table-cell">
            Vehicle
          </AdminTableHeaderCell>
          <AdminTableHeaderCell>Status</AdminTableHeaderCell>
          <AdminTableHeaderCell>Deposit</AdminTableHeaderCell>
          <AdminTableHeaderCell>Total</AdminTableHeaderCell>
          <AdminTableHeaderCell aria-hidden="true" className="w-8" />
        </AdminTableHead>
        <tbody>
          {filteredBookings.map((booking) => {
            const customer = getRelation(booking.customers);
            const bookingVehicles = Array.isArray(booking.booking_vehicles)
              ? booking.booking_vehicles
              : [];
            const depositAmount = booking.deposit_amount;
            const hasDeposit =
              depositAmount != null && Number(depositAmount) > 0;
            return (
              <AdminTableRow
                key={booking.id}
                href={`/admin/bookings/${booking.id}`}
              >
                <AdminTableCell className="font-mono text-xs text-white/70">
                  {booking.confirmation_code}
                </AdminTableCell>
                <AdminTableCell>
                  <p className="font-medium text-white">
                    {customer?.full_name}
                  </p>
                  <p className="text-xs text-white/50">
                    {customer?.email ?? customer?.phone ?? "—"}
                  </p>
                </AdminTableCell>
                <AdminTableCell className="text-white/70">
                  {formatBookingDateRange(
                    booking.booking_date,
                    booking.end_date,
                  )}
                </AdminTableCell>
                <AdminTableCell className="hidden text-white/70 md:table-cell">
                  {formatBookingVehiclesLabel(bookingVehicles)}
                </AdminTableCell>
                <AdminTableCell>
                  <BookingStatusBadge status={booking.status} />
                </AdminTableCell>
                <AdminTableCell
                  className={cn(
                    hasDeposit && !booking.deposit_paid
                      ? "text-white/40"
                      : "text-white/70",
                  )}
                >
                  {hasDeposit
                    ? `€${Number(depositAmount).toFixed(2)}`
                    : "—"}
                </AdminTableCell>
                <AdminTableCell className="text-white/70">
                  €{Number(booking.total_price).toFixed(2)}
                </AdminTableCell>
                <AdminTableCell className="text-white/30">
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </AdminTableCell>
              </AdminTableRow>
            );
          })}
        </tbody>
      </AdminDataTable>
    </div>
  );
}

import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/admin";
import { getRelation } from "@/lib/admin/supabase-relations";
import { formatBookingVehiclesLabel } from "@/lib/utils/booking-vehicles";
import { formatBookingDateRange } from "@/lib/utils/booking";
import {
  AdminDataTable,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
} from "@/components/admin/admin-data-table";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import { Button } from "@/components/ui/button";

export default async function BookingsPage() {
  const { supabase } = await requireAdmin();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, customers(full_name, email, phone), booking_vehicles(vehicles(make, model))")
    .order("booking_date", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bookings</h1>
          <p className="mt-1 text-sm text-white/60">
            {bookings?.length ?? 0} booking{bookings?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/bookings/new">
            <Plus className="h-4 w-4" />
            New booking
          </Link>
        </Button>
      </div>

      <AdminDataTable
        isEmpty={!bookings?.length}
        emptyMessage={
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
          <AdminTableHeaderCell className="hidden sm:table-cell">
            Total
          </AdminTableHeaderCell>
          <AdminTableHeaderCell aria-hidden="true" className="w-8" />
        </AdminTableHead>
        <tbody>
          {bookings?.map((booking) => {
            const customer = getRelation(booking.customers);
            const bookingVehicles = Array.isArray(booking.booking_vehicles)
              ? booking.booking_vehicles
              : [];
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
                <AdminTableCell className="hidden text-white/70 sm:table-cell">
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

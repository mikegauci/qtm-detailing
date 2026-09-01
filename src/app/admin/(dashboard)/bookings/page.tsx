import Link from "next/link";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/admin";
import { getCustomerRelation, getRelation } from "@/lib/admin/supabase-relations";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
} from "@/lib/utils/booking";
import { Button } from "@/components/ui/button";

export default async function BookingsPage() {
  const { supabase } = await requireAdmin();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, customers(full_name, email), vehicles(make, model, registration)")
    .order("booking_date", { ascending: false })
    .order("start_time", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bookings</h1>
          <p className="mt-1 text-sm text-white/60">
            {bookings?.length ?? 0} booking{bookings?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/bookings/new">
            <Plus className="h-4 w-4" />
            New booking
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-left text-white/60">
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Vehicle</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {bookings?.map((booking) => {
              const customer = getCustomerRelation(booking.customers);
              const vehicle = getRelation(booking.vehicles);
              return (
              <tr
                key={booking.id}
                className="border-b border-white/5 hover:bg-white/5"
              >
                <td className="px-4 py-3 font-mono text-xs text-white/70">
                  {booking.confirmation_code}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-white">
                    {customer?.full_name}
                  </p>
                  <p className="text-xs text-white/50">
                    {customer?.email}
                  </p>
                </td>
                <td className="px-4 py-3 text-white/70">
                  {format(new Date(booking.booking_date), "d MMM yyyy")}
                </td>
                <td className="px-4 py-3 text-white/70">
                  {booking.start_time.slice(0, 5)} –{" "}
                  {booking.end_time.slice(0, 5)}
                </td>
                <td className="px-4 py-3 text-white/70">
                  {vehicle
                    ? [vehicle.make, vehicle.model]
                        .filter(Boolean)
                        .join(" ") || vehicle.registration
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${BOOKING_STATUS_COLORS[booking.status]}`}
                  >
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/70">
                  €{Number(booking.total_price).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/bookings/${booking.id}`}>View</Link>
                  </Button>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>

        {!bookings?.length && (
          <p className="px-4 py-12 text-center text-sm text-white/50">
            No bookings yet.{" "}
            <Link
              href="/admin/bookings/new"
              className="text-brand-purple-400 hover:underline"
            >
              Create the first one
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}

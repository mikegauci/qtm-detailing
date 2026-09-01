import Link from "next/link";
import { format } from "date-fns";
import { requireAdmin } from "@/lib/supabase/admin";
import { getCustomerRelation } from "@/lib/admin/supabase-relations";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  LEAD_STATUS_LABELS,
} from "@/lib/utils/booking";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();
  const today = format(new Date(), "yyyy-MM-dd");

  const [
    { count: todayBookingsCount },
    { count: newLeadsCount },
    { count: inProgressCount },
    { data: inventoryItems },
    { data: recentLeads },
    { data: todayBookings },
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("booking_date", today)
      .neq("status", "cancelled"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "in_progress"),
    supabase.from("inventory_items").select("*"),
    supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("bookings")
      .select("*, customers(full_name)")
      .eq("booking_date", today)
      .neq("status", "cancelled")
      .order("start_time", { ascending: true }),
  ]);

  const lowStockItems =
    inventoryItems?.filter(
      (item) =>
        item.low_stock_threshold !== null &&
        item.quantity <= item.low_stock_threshold,
    ) ?? [];

  const stats = [
    {
      label: "Today's Bookings",
      value: todayBookingsCount ?? 0,
      href: "/admin/bookings",
    },
    {
      label: "New Leads",
      value: newLeadsCount ?? 0,
      href: "/admin/leads",
    },
    {
      label: "In Progress",
      value: inProgressCount ?? 0,
      href: "/admin/kanban",
    },
    {
      label: "Low Stock Items",
      value: lowStockItems.length,
      href: "/admin/inventory",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-white/60">
          Overview for {format(new Date(), "EEEE, d MMMM yyyy")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-colors hover:border-brand-purple-500/30">
              <CardContent className="pt-0">
                <p className="text-sm text-white/60">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-white">{stat.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Leads</CardTitle>
            <Link
              href="/admin/leads"
              className="text-sm text-brand-purple-400 hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentLeads?.length ? (
              <ul className="divide-y divide-white/10">
                {recentLeads.map((lead) => (
                  <li
                    key={lead.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-white">{lead.name}</p>
                      <p className="text-sm text-white/50">{lead.email}</p>
                    </div>
                    <Badge variant="outline">
                      {LEAD_STATUS_LABELS[lead.status] ?? lead.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/50">No leads yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today&apos;s Bookings</CardTitle>
            <Link
              href="/admin/calendar"
              className="text-sm text-brand-purple-400 hover:underline"
            >
              Calendar
            </Link>
          </CardHeader>
          <CardContent>
            {todayBookings?.length ? (
              <ul className="divide-y divide-white/10">
                {todayBookings.map((booking) => {
                  const customer = getCustomerRelation(booking.customers);
                  return (
                    <li key={booking.id} className="py-3 first:pt-0 last:pb-0">
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="flex items-center justify-between hover:opacity-80"
                      >
                        <div>
                          <p className="font-medium text-white">
                            {customer?.full_name ?? "Unknown"}
                          </p>
                          <p className="text-sm text-white/50">
                            {booking.start_time.slice(0, 5)} –{" "}
                            {booking.end_time.slice(0, 5)}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${BOOKING_STATUS_COLORS[booking.status]}`}
                        >
                          {BOOKING_STATUS_LABELS[booking.status]}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-white/50">No bookings scheduled today.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-white/10">
              {lowStockItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <span className="text-white">{item.name}</span>
                  <Badge variant="warning">
                    {item.quantity} {item.unit ?? "units"} left
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

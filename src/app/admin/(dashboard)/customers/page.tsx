import Link from "next/link";
import { format } from "date-fns";
import { requireAdmin } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function CustomersPage() {
  const { supabase } = await requireAdmin();

  const { data: customers } = await supabase
    .from("customers")
    .select("*, vehicles(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="mt-1 text-sm text-white/60">
            {customers?.length ?? 0} customer{customers?.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-left text-white/60">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Vehicles</th>
              <th className="px-4 py-3 font-medium">Since</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {customers?.map((customer) => (
              <tr
                key={customer.id}
                className="border-b border-white/5 hover:bg-white/5"
              >
                <td className="px-4 py-3 font-medium text-white">
                  {customer.full_name}
                </td>
                <td className="px-4 py-3 text-white/70">{customer.email}</td>
                <td className="px-4 py-3 text-white/70">
                  {customer.phone ?? "—"}
                </td>
                <td className="px-4 py-3 text-white/70">
                  {customer.vehicles?.[0]?.count ?? 0}
                </td>
                <td className="px-4 py-3 text-white/50">
                  {format(new Date(customer.created_at), "d MMM yyyy")}
                </td>
                <td className="px-4 py-3">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/customers/${customer.id}`}>View</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!customers?.length && (
          <Card className="border-0 bg-transparent">
            <CardContent className="py-12 text-center">
              <p className="text-white/50">No customers yet.</p>
              <p className="mt-1 text-sm text-white/40">
                Convert leads or create customers when booking.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

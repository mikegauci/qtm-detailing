"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDisplayDate } from "@/lib/utils/dates";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createCustomer } from "@/app/actions/admin/customers";
import { DeleteCustomerButton } from "@/components/admin/delete-customer-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Customer = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  vehicles: { count: number }[];
  lifetime_value: number;
  booking_count: number;
};

export function CustomersManager({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleCreateCustomer(formData: FormData) {
    startTransition(async () => {
      const result = await createCustomer({
        full_name: formData.get("full_name") as string,
        email: (formData.get("email") as string) || null,
        phone: (formData.get("phone") as string) || null,
      });

      if (result.success) {
        toast.success(result.message);
        setShowAddCustomer(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          onClick={() => setShowAddCustomer(!showAddCustomer)}
        >
          <Plus className="h-4 w-4" />
          Add customer
        </Button>
      </div>

      {showAddCustomer && (
        <form
          action={handleCreateCustomer}
          className="space-y-4 rounded-xl border border-white/10 p-4"
        >
          <p className="text-sm font-medium text-white">
            Add a customer manually
          </p>
          <p className="text-xs text-white/50">
            Phone or email required — leave email blank if they prefer phone
            contact only.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="customer_full_name">Full name</Label>
              <Input id="customer_full_name" name="full_name" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="customer_email">Email (optional)</Label>
              <Input id="customer_email" name="email" type="email" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="customer_phone">Phone</Label>
              <Input id="customer_phone" name="phone" />
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
                "Save customer"
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowAddCustomer(false)}
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
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Vehicles</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Since</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const totalPrice = customer.lifetime_value;

              return (
              <tr
                key={customer.id}
                className="border-b border-white/5 hover:bg-white/5"
              >
                <td className="px-4 py-3 font-medium text-white">
                  {customer.full_name}
                </td>
                <td className="px-4 py-3 text-white/70">
                  {customer.email ?? "—"}
                </td>
                <td className="px-4 py-3 text-white/70">
                  {customer.phone ?? "—"}
                </td>
                <td className="px-4 py-3 text-white/70">
                  {customer.vehicles?.[0]?.count ?? 0}
                </td>
                <td className="px-4 py-3 text-white/70">
                  {totalPrice > 0 ? `€${totalPrice.toFixed(2)}` : "—"}
                </td>
                <td className="px-4 py-3 text-white/50">
                  {formatDisplayDate(customer.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/customers/${customer.id}`}>View</Link>
                    </Button>
                    <DeleteCustomerButton
                      customerId={customer.id}
                      customerName={customer.full_name}
                      bookingCount={customer.booking_count}
                      vehicleCount={customer.vehicles?.[0]?.count ?? 0}
                      redirectTo="/admin/customers"
                      size="icon-sm"
                      variant="ghost"
                      showLabel={false}
                    />
                  </div>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>

        {customers.length === 0 && (
          <p className="px-4 py-12 text-center text-sm text-white/50">
            No customers yet. Add one manually, convert a lead, or create one
            when booking.
          </p>
        )}
      </div>
    </div>
  );
}

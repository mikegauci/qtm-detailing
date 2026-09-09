"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDisplayDate } from "@/lib/utils/dates";
import { Plus } from "lucide-react";
import { AddCustomerForm } from "@/components/admin/add-customer-form";
import { DeleteCustomerButton } from "@/components/admin/delete-customer-button";
import {
  AdminDataTable,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
} from "@/components/admin/admin-data-table";
import { Button } from "@/components/ui/button";

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
        <AddCustomerForm
          onSuccess={async () => {
            setShowAddCustomer(false);
            router.refresh();
          }}
          onCancel={() => setShowAddCustomer(false)}
        />
      )}

      <AdminDataTable
        isEmpty={customers.length === 0}
        emptyMessage="No customers yet. Add one manually, convert a lead, or create one when booking."
      >
        <AdminTableHead>
          <AdminTableHeaderCell>Name</AdminTableHeaderCell>
          <AdminTableHeaderCell>Email</AdminTableHeaderCell>
          <AdminTableHeaderCell>Phone</AdminTableHeaderCell>
          <AdminTableHeaderCell>Vehicles</AdminTableHeaderCell>
          <AdminTableHeaderCell>Price</AdminTableHeaderCell>
          <AdminTableHeaderCell>Since</AdminTableHeaderCell>
          <AdminTableHeaderCell aria-hidden="true">&nbsp;</AdminTableHeaderCell>
        </AdminTableHead>
        <tbody>
          {customers.map((customer) => {
            const totalPrice = customer.lifetime_value;

            return (
              <AdminTableRow key={customer.id}>
                <AdminTableCell className="font-medium text-white">
                  {customer.full_name}
                </AdminTableCell>
                <AdminTableCell className="text-white/70">
                  {customer.email ?? "—"}
                </AdminTableCell>
                <AdminTableCell className="text-white/70">
                  {customer.phone ?? "—"}
                </AdminTableCell>
                <AdminTableCell className="text-white/70">
                  {customer.vehicles?.[0]?.count ?? 0}
                </AdminTableCell>
                <AdminTableCell className="text-white/70">
                  {totalPrice > 0 ? `€${totalPrice.toFixed(2)}` : "—"}
                </AdminTableCell>
                <AdminTableCell className="text-white/50">
                  {formatDisplayDate(customer.created_at)}
                </AdminTableCell>
                <AdminTableCell>
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
                </AdminTableCell>
              </AdminTableRow>
            );
          })}
        </tbody>
      </AdminDataTable>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createVehicle,
  deleteVehicle,
  updateCustomer,
} from "@/app/actions/admin/customers";
import { DeleteCustomerButton } from "@/components/admin/delete-customer-button";
import type { Tables } from "@/lib/supabase/types";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
} from "@/lib/utils/booking";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Customer = Tables<"customers">;
type Vehicle = Tables<"vehicles">;
type Booking = Tables<"bookings">;

type BookingWithRelations = Booking & {
  vehicles: Pick<Vehicle, "make" | "model" | "registration"> | null;
};

export function CustomerDetail({
  customer,
  vehicles,
  bookings,
}: {
  customer: Customer;
  vehicles: Vehicle[];
  bookings: BookingWithRelations[];
}) {
  const [isPending, startTransition] = useTransition();
  const [showVehicleForm, setShowVehicleForm] = useState(false);

  function handleUpdateCustomer(formData: FormData) {
    startTransition(async () => {
      const result = await updateCustomer(customer.id, {
        full_name: formData.get("full_name") as string,
        email: formData.get("email") as string,
        phone: (formData.get("phone") as string) || null,
      });
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  function handleAddVehicle(formData: FormData) {
    startTransition(async () => {
      const result = await createVehicle({
        customer_id: customer.id,
        make: (formData.get("make") as string) || null,
        model: (formData.get("model") as string) || null,
        registration: (formData.get("registration") as string) || null,
        vehicle_type: (formData.get("vehicle_type") as string) || null,
      });
      if (result.success) {
        toast.success(result.message);
        setShowVehicleForm(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleDeleteVehicle(vehicleId: string) {
    if (!confirm("Remove this vehicle?")) return;
    startTransition(async () => {
      const result = await deleteVehicle(vehicleId, customer.id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/customers">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">{customer.full_name}</h1>
          <p className="text-sm text-white/60">{customer.email}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleUpdateCustomer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  defaultValue={customer.full_name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={customer.email}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={customer.phone ?? ""}
                />
              </div>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Vehicles</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowVehicleForm(!showVehicleForm)}
            >
              <Plus className="h-4 w-4" />
              Add vehicle
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {showVehicleForm && (
              <form
                action={handleAddVehicle}
                className="space-y-3 rounded-lg border border-white/10 p-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="make">Make</Label>
                    <Input id="make" name="make" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="model">Model</Label>
                    <Input id="model" name="model" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="registration">Registration</Label>
                    <Input id="registration" name="registration" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="vehicle_type">Type</Label>
                    <Input
                      id="vehicle_type"
                      name="vehicle_type"
                      placeholder="sedan, suv, van"
                    />
                  </div>
                </div>
                <Button type="submit" size="sm" disabled={isPending}>
                  Save vehicle
                </Button>
              </form>
            )}

            {vehicles.length ? (
              <ul className="divide-y divide-white/10">
                {vehicles.map((vehicle) => (
                  <li
                    key={vehicle.id}
                    className="flex items-center justify-between py-3 first:pt-0"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {[vehicle.make, vehicle.model].filter(Boolean).join(" ") ||
                          "Unnamed vehicle"}
                      </p>
                      <p className="text-sm text-white/50">
                        {vehicle.registration ?? "No reg"} ·{" "}
                        {vehicle.vehicle_type ?? "—"}
                      </p>
                    </div>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/50">No vehicles on file.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-white/60">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Time</th>
                    <th className="pb-3 font-medium">Vehicle</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="py-3 text-white">
                        {format(new Date(booking.booking_date), "d MMM yyyy")}
                      </td>
                      <td className="py-3 text-white/70">
                        {booking.start_time.slice(0, 5)} –{" "}
                        {booking.end_time.slice(0, 5)}
                      </td>
                      <td className="py-3 text-white/70">
                        {booking.vehicles
                          ? [booking.vehicles.make, booking.vehicles.model]
                              .filter(Boolean)
                              .join(" ") || booking.vehicles.registration
                          : "—"}
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs ${BOOKING_STATUS_COLORS[booking.status]}`}
                        >
                          {BOOKING_STATUS_LABELS[booking.status]}
                        </span>
                      </td>
                      <td className="py-3 text-white/70">
                        €{Number(booking.total_price).toFixed(2)}
                      </td>
                      <td className="py-3">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/admin/bookings/${booking.id}`}>View</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-white/50">No bookings yet.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <DeleteCustomerButton
          customerId={customer.id}
          customerName={customer.full_name}
          bookingCount={bookings.length}
          vehicleCount={vehicles.length}
          redirectTo="/admin/customers"
        />
      </div>
    </div>
  );
}

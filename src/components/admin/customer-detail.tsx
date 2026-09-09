"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  createReferenceBooking,
  updateBooking,
} from "@/app/actions/admin/bookings";
import {
  deleteVehicle,
  updateCustomer,
} from "@/app/actions/admin/customers";
import { CustomerVehiclesPanel } from "@/components/admin/customer-vehicles-panel";
import { formatBookingVehiclesLabel } from "@/lib/utils/booking-vehicles";
import { DeleteCustomerButton } from "@/components/admin/delete-customer-button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import type { Tables } from "@/lib/supabase/types";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
} from "@/lib/utils/booking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Customer = Tables<"customers">;
type Vehicle = Tables<"vehicles">;
type Booking = Tables<"bookings">;

type BookingWithRelations = Booking & {
  booking_vehicles: {
    vehicles: Pick<Vehicle, "make" | "model"> | null;
  }[];
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPastBookingForm, setShowPastBookingForm] = useState(false);
  const [pastBookingVehicleId, setPastBookingVehicleId] = useState<string>("");

  function handleUpdateCustomer(formData: FormData) {
    startTransition(async () => {
      const result = await updateCustomer(customer.id, {
        full_name: formData.get("full_name") as string,
        email: (formData.get("email") as string) || null,
        phone: (formData.get("phone") as string) || null,
      });
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  function handleDeleteVehicle(vehicleId: string) {
    if (!confirm("Remove this vehicle?")) return;
    startTransition(async () => {
      const result = await deleteVehicle(vehicleId, customer.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleAddPastBooking(formData: FormData) {
    startTransition(async () => {
      const chargedRaw = (formData.get("charged_customer") as string).trim();
      const chargedCustomer = chargedRaw ? Number(chargedRaw) : null;

      const result = await createReferenceBooking({
        customer_id: customer.id,
        vehicle_ids: pastBookingVehicleId ? [pastBookingVehicleId] : [],
        booking_date: formData.get("booking_date") as string,
        end_date: (formData.get("end_date") as string) || null,
        notes: (formData.get("notes") as string) || null,
        total_price:
          chargedCustomer !== null && !Number.isNaN(chargedCustomer)
            ? chargedCustomer
            : null,
      });

      if (result.success) {
        toast.success(result.message);
        setShowPastBookingForm(false);
        setPastBookingVehicleId("");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleUpdateBookingCharged(bookingId: string, value: string) {
    const trimmed = value.trim();
    const nextPrice = trimmed === "" ? 0 : Number(trimmed);
    if (trimmed !== "" && (Number.isNaN(nextPrice) || nextPrice < 0)) {
      toast.error("Enter a valid amount.");
      return;
    }

    startTransition(async () => {
      const result = await updateBooking(bookingId, {
        total_price: nextPrice,
      });
      if (result.success) {
        toast.success("Charged customer updated.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleUpdateBookingDates(
    bookingId: string,
    data: { booking_date?: string; end_date?: string },
  ) {
    startTransition(async () => {
      const result = await updateBooking(bookingId, data);
      if (result.success) {
        toast.success("Booking dates updated.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  const contactSubtitle = customer.email ?? customer.phone ?? "No contact on file";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        backHref="/admin/customers"
        title={customer.full_name}
        subtitle={contactSubtitle}
      />

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
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={customer.email ?? ""}
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

        <CustomerVehiclesPanel
          mode="manage"
          customerId={customer.id}
          vehicles={vehicles}
          onDeleteVehicle={handleDeleteVehicle}
          deleteDisabled={isPending}
          onUpdated={() => router.refresh()}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Booking History</CardTitle>
            <p className="mt-1 text-sm text-white/50">
              Add past bookings for reference and edit dates as needed.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowPastBookingForm(!showPastBookingForm)}
          >
            <Plus className="h-4 w-4" />
            Add past booking
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showPastBookingForm && (
            <form
              action={handleAddPastBooking}
              className="space-y-3 rounded-lg border border-white/10 p-4"
            >
              <p className="text-sm text-white/70">
                Record a previous visit — date can be adjusted later.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="past_booking_date">Start date</Label>
                  <Input
                    id="past_booking_date"
                    name="booking_date"
                    type="date"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Vehicle (optional)</Label>
                  <Select
                    value={pastBookingVehicleId || "none"}
                    onValueChange={(value) =>
                      setPastBookingVehicleId(value === "none" ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No vehicle</SelectItem>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {[vehicle.make, vehicle.model]
                            .filter(Boolean)
                            .join(" ") || "Unnamed"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="past_booking_end_date">End date</Label>
                  <Input
                    id="past_booking_end_date"
                    name="end_date"
                    type="date"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="past_booking_charged">Charged customer</Label>
                  <Input
                    id="past_booking_charged"
                    name="charged_customer"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 150"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="past_booking_notes">Notes (optional)</Label>
                <Textarea id="past_booking_notes" name="notes" rows={2} />
              </div>
              <Button type="submit" size="sm" disabled={isPending}>
                Save past booking
              </Button>
            </form>
          )}

          {bookings.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-white/60">
                    <th className="pb-3 font-medium">Start date</th>
                    <th className="pb-3 font-medium">End date</th>
                    <th className="pb-3 font-medium">Vehicle</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Charged customer</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="py-3">
                        <Input
                          type="date"
                          defaultValue={booking.booking_date}
                          className="h-8 w-36"
                          disabled={isPending}
                          onBlur={(event) => {
                            const nextDate = event.target.value;
                            if (
                              nextDate &&
                              nextDate !== booking.booking_date
                            ) {
                              handleUpdateBookingDates(booking.id, {
                                booking_date: nextDate,
                              });
                            }
                          }}
                        />
                      </td>
                      <td className="py-3">
                        <Input
                          type="date"
                          defaultValue={booking.end_date ?? booking.booking_date}
                          className="h-8 w-36"
                          disabled={isPending}
                          onBlur={(event) => {
                            const nextDate = event.target.value;
                            const currentEnd = booking.end_date ?? booking.booking_date;
                            if (nextDate && nextDate !== currentEnd) {
                              handleUpdateBookingDates(booking.id, {
                                end_date: nextDate,
                              });
                            }
                          }}
                        />
                      </td>
                      <td className="py-3 text-white/70">
                        {formatBookingVehiclesLabel(booking.booking_vehicles)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs ${BOOKING_STATUS_COLORS[booking.status]}`}
                        >
                          {BOOKING_STATUS_LABELS[booking.status]}
                        </span>
                      </td>
                      <td className="py-3">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={
                            Number(booking.total_price) > 0
                              ? Number(booking.total_price)
                              : ""
                          }
                          placeholder="—"
                          className="h-8 w-28"
                          disabled={isPending}
                          onBlur={(event) => {
                            const current =
                              Number(booking.total_price) > 0
                                ? String(Number(booking.total_price))
                                : "";
                            if (event.target.value !== current) {
                              handleUpdateBookingCharged(
                                booking.id,
                                event.target.value,
                              );
                            }
                          }}
                        />
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
            <p className="text-sm text-white/50">
              No bookings yet. Add a past booking for reference.
            </p>
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

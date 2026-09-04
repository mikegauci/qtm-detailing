"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  addBookingService,
  deleteBooking,
  removeBookingService,
  updateBooking,
  updateBookingStatus,
} from "@/app/actions/admin/bookings";
import type { Tables } from "@/lib/supabase/types";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  formatBookingDateRange,
} from "@/lib/utils/booking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Booking = Tables<"bookings">;
type Customer = Tables<"customers">;
type Vehicle = Tables<"vehicles">;
type Service = Tables<"services">;

type BookingService = Tables<"booking_services"> & {
  services: Pick<Service, "id" | "name"> | null;
};

const STATUS_OPTIONS = Object.keys(BOOKING_STATUS_LABELS);

export function BookingDetail({
  booking,
  customer,
  vehicle,
  bookingServices,
  availableServices,
}: {
  booking: Booking;
  customer: Customer;
  vehicle: Vehicle | null;
  bookingServices: BookingService[];
  availableServices: Service[];
}) {
  const [isPending, startTransition] = useTransition();
  const [addServiceId, setAddServiceId] = useState("");
  const [chargedAmount, setChargedAmount] = useState("");

  useEffect(() => {
    setChargedAmount(
      Number(booking.total_price) > 0 ? String(Number(booking.total_price)) : "",
    );
  }, [booking.total_price]);

  const unaddedServices = availableServices.filter(
    (s) => !bookingServices.some((bs) => bs.service_id === s.id),
  );

  function handleStatusChange(status: string) {
    startTransition(async () => {
      const result = await updateBookingStatus(
        booking.id,
        status as Booking["status"],
      );
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  function handleUpdate(formData: FormData) {
    startTransition(async () => {
      const result = await updateBooking(booking.id, {
        booking_date: formData.get("booking_date") as string,
        end_date: (formData.get("end_date") as string) || null,
        notes: (formData.get("notes") as string) || null,
      });
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  function handleServicesRow() {
    const trimmedAmount = chargedAmount.trim();
    const parsedAmount =
      trimmedAmount === "" ? null : Number(trimmedAmount);

    if (trimmedAmount !== "" && (parsedAmount === null || parsedAmount < 0)) {
      toast.error("Enter a valid amount.");
      return;
    }

    if (!addServiceId && parsedAmount === null) {
      toast.error("Select a service or enter an amount.");
      return;
    }

    startTransition(async () => {
      if (addServiceId) {
        const result = await addBookingService(booking.id, addServiceId);
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        setAddServiceId("");
        toast.success(result.message);
        return;
      }

      if (parsedAmount !== null) {
        const result = await updateBooking(booking.id, {
          total_price: parsedAmount,
        });
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        toast.success("Charged customer updated.");
      }
    });
  }

  function handleRemoveService(bookingServiceId: string) {
    startTransition(async () => {
      const result = await removeBookingService(bookingServiceId, booking.id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  function handleDelete() {
    if (!confirm("Delete this booking permanently?")) return;
    startTransition(async () => {
      const result = await deleteBooking(booking.id);
      if (result.success) {
        toast.success(result.message);
        window.location.href = "/admin/bookings";
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/bookings">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {booking.confirmation_code}
            </h1>
            <p className="text-sm text-white/60">
              {customer.full_name} ·{" "}
              {formatBookingDateRange(booking.booking_date, booking.end_date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={booking.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {BOOKING_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span
            className={`hidden rounded-full border px-2.5 py-0.5 text-xs font-medium sm:inline ${BOOKING_STATUS_COLORS[booking.status]}`}
          >
            {BOOKING_STATUS_LABELS[booking.status]}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-white">{customer.full_name}</p>
            <p className="text-white/60">
              {customer.email ?? customer.phone ?? "—"}
            </p>
            {customer.phone && (
              <p className="text-white/60">{customer.phone}</p>
            )}
            <Button asChild size="sm" variant="outline" className="mt-2">
              <Link href={`/admin/customers/${customer.id}`}>View customer</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {vehicle ? (
              <div className="space-y-1">
                <p className="text-white">
                  {[vehicle.make, vehicle.model].filter(Boolean).join(" ")}
                </p>
                <p className="text-white/60">
                  {vehicle.registration ?? "No registration"} ·{" "}
                  {vehicle.vehicle_type ?? "—"}
                </p>
              </div>
            ) : (
              <p className="text-white/50">No vehicle assigned.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule & Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="booking_date">Start date</Label>
              <Input
                id="booking_date"
                name="booking_date"
                type="date"
                defaultValue={booking.booking_date}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End date</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                defaultValue={booking.end_date ?? booking.booking_date}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                defaultValue={booking.notes ?? ""}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookingServices.length > 0 ? (
            <ul className="divide-y divide-white/10">
              {bookingServices.map((bs) => (
                <li
                  key={bs.id}
                  className="flex items-center justify-between py-3 first:pt-0"
                >
                  <div>
                    <p className="text-white">{bs.services?.name ?? "Service"}</p>
                    {Number(bs.price_snapshot) > 0 && (
                      <p className="text-sm text-white/50">
                        €{Number(bs.price_snapshot).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => handleRemoveService(bs.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/50">No services listed.</p>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
            {unaddedServices.length > 0 && (
              <Select value={addServiceId} onValueChange={setAddServiceId}>
                <SelectTrigger className="min-w-[200px] flex-1">
                  <SelectValue placeholder="Add a service..." />
                </SelectTrigger>
                <SelectContent>
                  {unaddedServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Input
              type="number"
              min="0"
              step="0.01"
              value={chargedAmount}
              onChange={(event) => setChargedAmount(event.target.value)}
              placeholder="Charged customer"
              className="w-40"
            />
            <Button
              type="button"
              onClick={handleServicesRow}
              disabled={
                isPending ||
                (!addServiceId && chargedAmount.trim() === "")
              }
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : addServiceId ? (
                "Add"
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Delete booking
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

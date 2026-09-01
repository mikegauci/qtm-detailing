"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
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
        start_time: formData.get("start_time") as string,
        end_time: formData.get("end_time") as string,
        notes: (formData.get("notes") as string) || null,
      });
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  function handleAddService() {
    if (!addServiceId) return;
    startTransition(async () => {
      const result = await addBookingService(booking.id, addServiceId);
      if (result.success) {
        toast.success(result.message);
        setAddServiceId("");
      } else {
        toast.error(result.message);
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
              {format(new Date(booking.booking_date), "EEEE, d MMMM yyyy")}
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
            <p className="text-white/60">{customer.email}</p>
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
              <Label htmlFor="booking_date">Date</Label>
              <Input
                id="booking_date"
                name="booking_date"
                type="date"
                defaultValue={booking.booking_date}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_time">Start</Label>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                defaultValue={booking.start_time.slice(0, 5)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End</Label>
              <Input
                id="end_time"
                name="end_time"
                type="time"
                defaultValue={booking.end_time.slice(0, 5)}
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Services</CardTitle>
          <p className="text-lg font-semibold text-white">
            €{Number(booking.total_price).toFixed(2)}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="divide-y divide-white/10">
            {bookingServices.map((bs) => (
              <li
                key={bs.id}
                className="flex items-center justify-between py-3 first:pt-0"
              >
                <div>
                  <p className="text-white">{bs.services?.name ?? "Service"}</p>
                  <p className="text-sm text-white/50">
                    €{Number(bs.price_snapshot).toFixed(2)}
                  </p>
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

          {unaddedServices.length > 0 && (
            <div className="flex gap-2">
              <Select value={addServiceId} onValueChange={setAddServiceId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add a service..." />
                </SelectTrigger>
                <SelectContent>
                  {unaddedServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} (€{Number(service.price).toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={handleAddService}
                disabled={isPending || !addServiceId}
              >
                Add
              </Button>
            </div>
          )}
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

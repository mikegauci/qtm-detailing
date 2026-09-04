"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createBooking } from "@/app/actions/admin/bookings";
import { createCustomer } from "@/app/actions/admin/customers";
import type { Tables } from "@/lib/supabase/types";
import { formatCustomerOptionLabel } from "@/lib/utils/booking";
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

type Customer = Tables<"customers">;
type Vehicle = Tables<"vehicles">;
type Service = Tables<"services">;

export function BookingForm({
  customers,
  services,
}: {
  customers: (Customer & { vehicles: Vehicle[] })[];
  services: Service[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [customerId, setCustomerId] = useState<string>("");
  const [vehicleId, setVehicleId] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  const customerVehicles = useMemo(() => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.vehicles ?? [];
  }, [customers, customerId]);

  const totalPrice = useMemo(() => {
    return services
      .filter((s) => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + Number(s.price), 0);
  }, [services, selectedServices]);

  function toggleService(serviceId: string) {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  }

  function handleCreateCustomer() {
    const form = document.getElementById(
      "new-customer-fields",
    ) as HTMLDivElement | null;
    if (!form) return;

    const fullName = (
      form.querySelector('[name="full_name"]') as HTMLInputElement
    ).value;
    const email = (
      form.querySelector('[name="email"]') as HTMLInputElement
    ).value;
    const phone = (
      form.querySelector('[name="phone"]') as HTMLInputElement
    ).value;

    startTransition(async () => {
      const result = await createCustomer({
        full_name: fullName,
        email: email || null,
        phone: phone || null,
      });
      if (result.success && result.id) {
        toast.success(result.message);
        setCustomerId(result.id);
        setShowNewCustomer(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleSubmit(formData: FormData) {
    if (!customerId) {
      toast.error("Please select a customer.");
      return;
    }
    if (!selectedServices.length) {
      toast.error("Please select at least one service.");
      return;
    }

    startTransition(async () => {
      const result = await createBooking({
        customer_id: customerId,
        vehicle_id: vehicleId || null,
        booking_date: formData.get("booking_date") as string,
        end_date: (formData.get("end_date") as string) || null,
        notes: (formData.get("notes") as string) || null,
        service_ids: selectedServices,
      });

      if (result.success && result.id) {
        toast.success(result.message);
        router.push(`/admin/bookings/${result.id}`);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/bookings">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-white">New Booking</h1>
      </div>

      <form action={handleSubmit} className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer & Vehicle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Customer</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowNewCustomer(!showNewCustomer)}
                >
                  {showNewCustomer ? "Select existing" : "New customer"}
                </Button>
              </div>

              {showNewCustomer ? (
                <div
                  id="new-customer-fields"
                  className="space-y-3 rounded-lg border border-white/10 p-4"
                >
                  <div className="space-y-1">
                    <Label htmlFor="new_full_name">Full name</Label>
                    <Input id="new_full_name" name="full_name" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new_email">Email (optional)</Label>
                    <Input id="new_email" name="email" type="email" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new_phone">Phone</Label>
                    <Input id="new_phone" name="phone" />
                  </div>
                  <p className="text-xs text-white/50">
                    Phone or email required.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    disabled={isPending}
                    onClick={handleCreateCustomer}
                  >
                    Create customer
                  </Button>
                </div>
              ) : (
                <Select
                  value={customerId}
                  onValueChange={(value) => {
                    setCustomerId(value);
                    setVehicleId("");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {formatCustomerOptionLabel(customer)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {customerId && (
              <div className="space-y-2">
                <Label>Vehicle (optional)</Label>
                <Select
                  value={vehicleId || "none"}
                  onValueChange={(value) =>
                    setVehicleId(value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No vehicle</SelectItem>
                    {customerVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {[vehicle.make, vehicle.model]
                          .filter(Boolean)
                          .join(" ") ||
                          vehicle.registration ||
                          "Unnamed"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="booking_date">Start date</Label>
                <Input
                  id="booking_date"
                  name="booking_date"
                  type="date"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End date</Label>
                <Input id="end_date" name="end_date" type="date" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <label
                  key={service.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    selectedServices.includes(service.id)
                      ? "border-brand-purple-500/50 bg-brand-purple-600/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.id)}
                    onChange={() => toggleService(service.id)}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-white">{service.name}</p>
                    <p className="text-sm text-white/50">
                      €{Number(service.price).toFixed(2)}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {services.length === 0 && (
              <p className="text-sm text-white/50">No active services found.</p>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
              <p className="text-lg font-semibold text-white">
                Total: €{totalPrice.toFixed(2)}
              </p>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create booking"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createBooking } from "@/app/actions/admin/bookings";
import type { Tables } from "@/lib/supabase/types";
import { formatCustomerOptionLabel } from "@/lib/utils/booking";
import { AddCustomerForm } from "@/components/admin/add-customer-form";
import { CustomerVehiclesPanel } from "@/components/admin/customer-vehicles-panel";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [servicePrices, setServicePrices] = useState<Record<string, string>>(
    {},
  );
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  const customerVehicles = useMemo(() => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.vehicles ?? [];
  }, [customers, customerId]);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, serviceId) => {
      const raw = servicePrices[serviceId]?.trim() ?? "";
      if (!raw) return sum;
      const price = Number(raw);
      return sum + (Number.isFinite(price) ? price : 0);
    }, 0);
  }, [selectedServices, servicePrices]);

  function toggleService(serviceId: string) {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        setServicePrices((prices) => {
          const next = { ...prices };
          delete next[serviceId];
          return next;
        });
        return prev.filter((id) => id !== serviceId);
      }
      return [...prev, serviceId];
    });
  }

  function setServicePrice(serviceId: string, value: string) {
    setServicePrices((prev) => ({ ...prev, [serviceId]: value }));
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

    const servicePricesPayload: Record<string, number> = {};
    for (const serviceId of selectedServices) {
      const raw = servicePrices[serviceId]?.trim() ?? "";
      if (raw) {
        const price = Number(raw);
        if (!Number.isFinite(price) || price < 0) {
          toast.error("Enter a valid price for each selected service.");
          return;
        }
        servicePricesPayload[serviceId] = price;
      } else {
        servicePricesPayload[serviceId] = 0;
      }
    }

    startTransition(async () => {
      const result = await createBooking({
        customer_id: customerId,
        vehicle_ids: selectedVehicleIds,
        booking_date: formData.get("booking_date") as string,
        end_date: (formData.get("end_date") as string) || null,
        notes: (formData.get("notes") as string) || null,
        service_ids: selectedServices,
        service_prices: servicePricesPayload,
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
      <AdminPageHeader backHref="/admin/bookings" title="New Booking" />

      <div className="grid gap-6 lg:grid-cols-2">
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
                <AddCustomerForm
                  idPrefix="booking_customer"
                  onSuccess={async ({ id, vehicleId }) => {
                    setCustomerId(id);
                    setSelectedVehicleIds([vehicleId]);
                    setShowNewCustomer(false);
                    router.refresh();
                  }}
                  onCancel={() => setShowNewCustomer(false)}
                />
              ) : (
                <Select
                  value={customerId}
                  onValueChange={(value) => {
                    setCustomerId(value);
                    setSelectedVehicleIds([]);
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

            {customerId && !showNewCustomer && (
              <CustomerVehiclesPanel
                mode="assign"
                customerId={customerId}
                vehicles={customerVehicles}
                assignedVehicleIds={selectedVehicleIds}
                onAssign={async (id, _source) => {
                  setSelectedVehicleIds((prev) =>
                    prev.includes(id) ? prev : [...prev, id],
                  );
                }}
                onUnassign={async (id) => {
                  setSelectedVehicleIds((prev) =>
                    prev.filter((vehicleId) => vehicleId !== id),
                  );
                }}
                idPrefix="booking_vehicle"
                onUpdated={() => router.refresh()}
              />
            )}
          </CardContent>
        </Card>

        <form action={handleSubmit} className="contents">
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
              {services.map((service) => {
                const isSelected = selectedServices.includes(service.id);

                return (
                  <div
                    key={service.id}
                    className={`rounded-lg border p-3 transition-colors ${
                      isSelected
                        ? "border-brand-purple-500/50 bg-brand-purple-600/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleService(service.id)}
                        className="rounded"
                      />
                      <p className="flex-1 font-medium text-white">
                        {service.name}
                      </p>
                    </label>
                    {isSelected && (
                      <div className="mt-3 space-y-1 pl-7">
                        <Label htmlFor={`service_price_${service.id}`}>
                          Price
                        </Label>
                        <Input
                          id={`service_price_${service.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={servicePrices[service.id] ?? ""}
                          onChange={(event) =>
                            setServicePrice(service.id, event.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {services.length === 0 && (
              <p className="text-sm text-white/50">No active services found.</p>
            )}

            <div
              className={`mt-6 flex items-center border-t border-white/10 pt-4 ${totalPrice > 0 ? "justify-between" : "justify-end"}`}
            >
              {totalPrice > 0 && (
                <p className="text-lg font-semibold text-white">
                  Total: €{totalPrice.toFixed(2)}
                </p>
              )}
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
    </div>
  );
}

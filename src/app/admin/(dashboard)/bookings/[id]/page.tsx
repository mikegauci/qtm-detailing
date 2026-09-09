import { notFound } from "next/navigation";
import { BookingDetail } from "@/components/admin/booking-detail";
import { requireAdmin } from "@/lib/supabase/admin";
import type { Tables } from "@/lib/supabase/types";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const [{ data: bookingDetail }, { data: availableServices }] =
    await Promise.all([
      supabase
        .from("bookings")
        .select(
          "*, customers(*), booking_vehicles(vehicle_id), booking_services(*, services(id, name))",
        )
        .eq("id", id)
        .single(),
      supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ]);

  if (!bookingDetail?.customers) notFound();

  const customer = Array.isArray(bookingDetail.customers)
    ? bookingDetail.customers[0]
    : bookingDetail.customers;

  if (!customer) notFound();

  const { data: customerVehicles } = await supabase
    .from("vehicles")
    .select("*")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: true });

  const bookingVehicles: Pick<Tables<"booking_vehicles">, "vehicle_id">[] =
    Array.isArray(bookingDetail.booking_vehicles)
      ? bookingDetail.booking_vehicles
      : [];
  const assignedVehicleIds = bookingVehicles.map((row) => row.vehicle_id);

  const {
    customers: _customers,
    booking_vehicles: _bookingVehicles,
    booking_services: bookingServices,
    ...booking
  } = bookingDetail;

  return (
    <BookingDetail
      booking={booking}
      customer={customer}
      assignedVehicleIds={assignedVehicleIds}
      customerVehicles={customerVehicles ?? []}
      bookingServices={bookingServices ?? []}
      availableServices={availableServices ?? []}
    />
  );
}

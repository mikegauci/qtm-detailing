import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";
import { BookingDetail } from "@/components/admin/booking-detail";

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
          "*, customers(*), vehicles(*), booking_services(*, services(id, name))",
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
  const vehicle = Array.isArray(bookingDetail.vehicles)
    ? bookingDetail.vehicles[0] ?? null
    : bookingDetail.vehicles;

  if (!customer) notFound();

  const {
    customers: _customers,
    vehicles: _vehicles,
    booking_services: bookingServices,
    ...booking
  } = bookingDetail;

  return (
    <BookingDetail
      booking={booking}
      customer={customer}
      vehicle={vehicle}
      bookingServices={bookingServices ?? []}
      availableServices={availableServices ?? []}
    />
  );
}

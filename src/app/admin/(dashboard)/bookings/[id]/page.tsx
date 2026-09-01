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

  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (!booking) notFound();

  const [
    { data: customer },
    { data: vehicle },
    { data: bookingServices },
    { data: availableServices },
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("*")
      .eq("id", booking.customer_id)
      .single(),
    booking.vehicle_id
      ? supabase
          .from("vehicles")
          .select("*")
          .eq("id", booking.vehicle_id)
          .single()
      : Promise.resolve({ data: null }),
    supabase
      .from("booking_services")
      .select("*, services(id, name)")
      .eq("booking_id", id),
    supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (!customer) notFound();

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

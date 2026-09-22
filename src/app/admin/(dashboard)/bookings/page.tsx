import { BookingsManager } from "@/components/admin/bookings-manager";
import { requireAdmin } from "@/lib/supabase/admin";

export default async function BookingsPage() {
  const { supabase } = await requireAdmin();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, customers(full_name, email, phone), booking_vehicles(vehicles(make, model))")
    .order("booking_date", { ascending: false });

  return <BookingsManager bookings={bookings ?? []} />;
}

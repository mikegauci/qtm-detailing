import { requireAdmin } from "@/lib/supabase/admin";
import { BookingForm } from "@/components/admin/booking-form";

export default async function NewBookingPage() {
  const { supabase } = await requireAdmin();

  const [{ data: customers }, { data: services }] = await Promise.all([
    supabase
      .from("customers")
      .select("*, vehicles(*)")
      .order("full_name", { ascending: true }),
    supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  return (
    <BookingForm
      customers={customers ?? []}
      services={services ?? []}
    />
  );
}

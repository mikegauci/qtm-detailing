import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";
import { CustomerDetail } from "@/components/admin/customer-detail";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (!customer) notFound();

  const [{ data: vehicles }, { data: bookings }] = await Promise.all([
    supabase
      .from("vehicles")
      .select("*")
      .eq("customer_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("bookings")
      .select("*, vehicles(make, model, registration)")
      .eq("customer_id", id)
      .order("booking_date", { ascending: false }),
  ]);

  return (
    <CustomerDetail
      customer={customer}
      vehicles={vehicles ?? []}
      bookings={bookings ?? []}
    />
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin";

export type ActionResult = {
  success: boolean;
  message: string;
  id?: string;
};

export async function createCustomer(data: {
  full_name: string;
  email: string;
  phone?: string | null;
}): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { data: customer, error } = await supabase
    .from("customers")
    .insert({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/customers");
  return { success: true, message: "Customer created.", id: customer.id };
}

export async function updateCustomer(
  id: string,
  data: {
    full_name?: string;
    email?: string;
    phone?: string | null;
  },
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("customers").update(data).eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
  return { success: true, message: "Customer updated." };
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { error: bookingsError } = await supabase
    .from("bookings")
    .delete()
    .eq("customer_id", id);

  if (bookingsError) {
    return { success: false, message: bookingsError.message };
  }

  const { error } = await supabase.from("customers").delete().eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/customers");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/kanban");
  revalidatePath("/admin");
  return { success: true, message: "Customer and all related data deleted." };
}

export async function createVehicle(data: {
  customer_id: string;
  make?: string | null;
  model?: string | null;
  registration?: string | null;
  vehicle_type?: string | null;
}): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .insert(data)
    .select("id")
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${data.customer_id}`);
  return { success: true, message: "Vehicle added.", id: vehicle.id };
}

export async function updateVehicle(
  id: string,
  customerId: string,
  data: {
    make?: string | null;
    model?: string | null;
    registration?: string | null;
    vehicle_type?: string | null;
  },
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("vehicles").update(data).eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(`/admin/customers/${customerId}`);
  return { success: true, message: "Vehicle updated." };
}

export async function deleteVehicle(
  id: string,
  customerId: string,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("vehicles").delete().eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(`/admin/customers/${customerId}`);
  return { success: true, message: "Vehicle removed." };
}

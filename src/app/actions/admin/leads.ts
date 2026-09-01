"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin";
import type { Enums } from "@/lib/supabase/types";

export type ActionResult = {
  success: boolean;
  message: string;
  customerId?: string;
};

export async function updateLeadStatus(
  leadId: string,
  status: Enums<"lead_status">,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", leadId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { success: true, message: "Lead status updated." };
}

export async function convertLeadToCustomer(
  leadId: string,
  options?: { createVehicle?: boolean },
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { data: lead, error: fetchError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .single();

  if (fetchError || !lead) {
    return { success: false, message: "Lead not found." };
  }

  if (lead.status === "converted") {
    return { success: false, message: "Lead is already converted." };
  }

  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("email", lead.email)
    .maybeSingle();

  let customerId = existingCustomer?.id;

  if (!customerId) {
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert({
        full_name: lead.name,
        email: lead.email,
        phone: lead.phone,
      })
      .select("id")
      .single();

    if (customerError || !customer) {
      return { success: false, message: customerError?.message ?? "Failed to create customer." };
    }

    customerId = customer.id;
  }

  const shouldCreateVehicle =
    options?.createVehicle !== false && Boolean(lead.vehicle?.trim());

  if (shouldCreateVehicle && lead.vehicle) {
    const { error: vehicleError } = await supabase.from("vehicles").insert({
      customer_id: customerId,
      model: lead.vehicle.trim(),
    });

    if (vehicleError) {
      return { success: false, message: vehicleError.message };
    }
  }

  const { error: leadError } = await supabase
    .from("leads")
    .update({ status: "converted" })
    .eq("id", leadId);

  if (leadError) {
    return { success: false, message: leadError.message };
  }

  revalidatePath("/admin/leads");
  revalidatePath("/admin/customers");
  revalidatePath("/admin");
  return {
    success: true,
    message: "Lead converted to customer.",
    customerId,
  };
}

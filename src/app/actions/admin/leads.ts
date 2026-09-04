"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/admin";
import type { Enums } from "@/lib/supabase/types";
import { LEAD_SOURCE_LABELS } from "@/lib/utils/booking";

export type ActionResult = {
  success: boolean;
  message: string;
  customerId?: string;
  id?: string;
};

const leadSourceSchema = z.enum(
  Object.keys(LEAD_SOURCE_LABELS) as [string, ...string[]],
);

const createLeadSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .optional(),
    phone: z.string().optional(),
    vehicle: z.string().optional(),
    notes: z.string().optional(),
    source: leadSourceSchema,
  })
  .refine(
    (data) => {
      const hasEmail = Boolean(data.email?.trim());
      const hasPhone = Boolean(data.phone?.trim());
      return hasEmail || hasPhone;
    },
    {
      message: "Phone or email is required.",
      path: ["phone"],
    },
  );

function normalizeOptionalString(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export async function createLead(data: {
  name: string;
  email?: string | null;
  phone?: string | null;
  vehicle?: string | null;
  notes?: string | null;
  source: string;
}): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const parsed = createLeadSchema.safeParse({
    name: data.name,
    email: normalizeOptionalString(data.email),
    phone: normalizeOptionalString(data.phone),
    vehicle: normalizeOptionalString(data.vehicle),
    notes: normalizeOptionalString(data.notes),
    source: data.source,
  });

  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Invalid lead details.";
    return { success: false, message };
  }

  const { name, email, phone, vehicle, notes, source } = parsed.data;

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      name,
      email: email ?? null,
      phone: phone ?? null,
      vehicle: vehicle ?? null,
      message: notes ?? null,
      source,
      status: "new",
    })
    .select("id")
    .single();

  if (error || !lead) {
    return { success: false, message: error?.message ?? "Failed to create lead." };
  }

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { success: true, message: "Lead added.", id: lead.id };
}

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

export async function deleteLead(leadId: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { data: lead, error: fetchError } = await supabase
    .from("leads")
    .select("id, name")
    .eq("id", leadId)
    .maybeSingle();

  if (fetchError) {
    return { success: false, message: fetchError.message };
  }

  if (!lead) {
    return { success: false, message: "Lead not found." };
  }

  const { error } = await supabase.from("leads").delete().eq("id", leadId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { success: true, message: `${lead.name} deleted.` };
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

  if (!lead.email?.trim() && !lead.phone?.trim()) {
    return {
      success: false,
      message: "Phone or email is required to convert to a customer.",
    };
  }

  let customerId: string | undefined;
  let createdCustomer = false;

  if (lead.email?.trim()) {
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", lead.email)
      .maybeSingle();

    customerId = existingCustomer?.id;
  }

  if (!customerId && lead.phone?.trim()) {
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", lead.phone)
      .maybeSingle();

    customerId = existingCustomer?.id;
  }

  if (!customerId) {
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert({
        full_name: lead.name,
        email: lead.email?.trim() || null,
        phone: lead.phone,
      })
      .select("id")
      .single();

    if (customerError || !customer) {
      return { success: false, message: customerError?.message ?? "Failed to create customer." };
    }

    customerId = customer.id;
    createdCustomer = true;
  }

  const shouldCreateVehicle =
    options?.createVehicle !== false && Boolean(lead.vehicle?.trim());

  if (shouldCreateVehicle && lead.vehicle) {
    const { error: vehicleError } = await supabase.from("vehicles").insert({
      customer_id: customerId,
      model: lead.vehicle.trim(),
    });

    if (vehicleError) {
      if (createdCustomer) {
        await supabase.from("customers").delete().eq("id", customerId);
      }
      return { success: false, message: vehicleError.message };
    }
  }

  const { error: leadError } = await supabase
    .from("leads")
    .update({ status: "converted" })
    .eq("id", leadId);

  if (leadError) {
    if (shouldCreateVehicle && lead.vehicle) {
      await supabase
        .from("vehicles")
        .delete()
        .eq("customer_id", customerId)
        .eq("model", lead.vehicle.trim());
    }
    if (createdCustomer) {
      await supabase.from("customers").delete().eq("id", customerId);
    }
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

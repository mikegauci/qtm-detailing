"use server";

import type { ActionResult } from "@/types/action-result";
import { requireAdmin } from "@/lib/supabase/admin";
import { revalidateInventory } from "@/lib/content/revalidate-cms";

type InventoryActionResult = ActionResult<{ id?: string }>;

export async function createInventoryItem(data: {
  name: string;
  quantity?: number;
  unit?: string | null;
  category?: string | null;
  low_stock_threshold?: number | null;
}): Promise<InventoryActionResult> {
  const { supabase } = await requireAdmin();

  const { data: item, error } = await supabase
    .from("inventory_items")
    .insert({
      name: data.name,
      quantity: data.quantity ?? 0,
      unit: data.unit ?? null,
      category: data.category ?? null,
      low_stock_threshold: data.low_stock_threshold ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidateInventory();
  return { success: true, message: "Inventory item created.", id: item.id };
}

export async function updateInventoryItem(
  id: string,
  data: {
    name?: string;
    quantity?: number;
    unit?: string | null;
    category?: string | null;
    low_stock_threshold?: number | null;
  },
): Promise<InventoryActionResult> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("inventory_items")
    .update(data)
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidateInventory();
  return { success: true, message: "Inventory item updated." };
}

export async function deleteInventoryItem(id: string): Promise<InventoryActionResult> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("inventory_items")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidateInventory();
  return { success: true, message: "Inventory item deleted." };
}

export async function restockInventoryItem(
  id: string,
  quantity: number,
): Promise<InventoryActionResult> {
  const { supabase } = await requireAdmin();

  const { data: item, error: fetchError } = await supabase
    .from("inventory_items")
    .select("quantity")
    .eq("id", id)
    .single();

  if (fetchError || !item) {
    return { success: false, message: "Item not found." };
  }

  const { error } = await supabase
    .from("inventory_items")
    .update({
      quantity: item.quantity + quantity,
      last_restocked_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidateInventory();
  return { success: true, message: "Stock updated." };
}

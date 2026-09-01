import { requireAdmin } from "@/lib/supabase/admin";
import { InventoryManager } from "@/components/admin/inventory-manager";

export default async function InventoryPage() {
  const { supabase } = await requireAdmin();

  const { data: items } = await supabase
    .from("inventory_items")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Inventory</h1>
        <p className="mt-1 text-sm text-white/60">
          Track products and supplies used for detailing jobs.
        </p>
      </div>

      <InventoryManager items={items ?? []} />
    </div>
  );
}

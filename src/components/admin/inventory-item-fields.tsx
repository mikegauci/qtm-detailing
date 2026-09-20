import type { Tables } from "@/lib/supabase/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type InventoryItemFieldsProps = {
  idPrefix: string;
  item?: Tables<"inventory_items">;
};

export function InventoryItemFields({ idPrefix, item }: InventoryItemFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}_name`}>Name</Label>
        <Input
          id={`${idPrefix}_name`}
          name="name"
          defaultValue={item?.name}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}_quantity`}>Quantity</Label>
          <Input
            id={`${idPrefix}_quantity`}
            name="quantity"
            type="number"
            min="0"
            defaultValue={item?.quantity ?? 0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}_unit`}>Unit</Label>
          <Input
            id={`${idPrefix}_unit`}
            name="unit"
            placeholder="bottles, rolls"
            defaultValue={item?.unit ?? ""}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}_category`}>Category</Label>
          <Input
            id={`${idPrefix}_category`}
            name="category"
            defaultValue={item?.category ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}_threshold`}>Low stock threshold</Label>
          <Input
            id={`${idPrefix}_threshold`}
            name="low_stock_threshold"
            type="number"
            min="0"
            defaultValue={item?.low_stock_threshold ?? ""}
          />
        </div>
      </div>
    </>
  );
}

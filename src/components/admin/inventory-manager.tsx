"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createInventoryItem,
  deleteInventoryItem,
  restockInventoryItem,
  updateInventoryItem,
} from "@/app/actions/admin/inventory";
import type { Tables } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type InventoryItem = Tables<"inventory_items">;

function isLowStock(item: InventoryItem) {
  return (
    item.low_stock_threshold !== null &&
    item.quantity <= item.low_stock_threshold
  );
}

export function InventoryManager({ items }: { items: InventoryItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createInventoryItem({
        name: formData.get("name") as string,
        quantity: Number(formData.get("quantity") || 0),
        unit: (formData.get("unit") as string) || null,
        category: (formData.get("category") as string) || null,
        low_stock_threshold: formData.get("low_stock_threshold")
          ? Number(formData.get("low_stock_threshold"))
          : null,
      });
      if (result.success) {
        toast.success(result.message);
        setShowCreate(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleUpdate(formData: FormData) {
    if (!editingItem) return;
    startTransition(async () => {
      const result = await updateInventoryItem(editingItem.id, {
        name: formData.get("name") as string,
        quantity: Number(formData.get("quantity")),
        unit: (formData.get("unit") as string) || null,
        category: (formData.get("category") as string) || null,
        low_stock_threshold: formData.get("low_stock_threshold")
          ? Number(formData.get("low_stock_threshold"))
          : null,
      });
      if (result.success) {
        toast.success(result.message);
        setEditingItem(null);
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this inventory item?")) return;
    startTransition(async () => {
      const result = await deleteInventoryItem(id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  function handleRestock(id: string) {
    const amount = prompt("How many units to add?");
    if (!amount || isNaN(Number(amount))) return;
    startTransition(async () => {
      const result = await restockInventoryItem(id, Number(amount));
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Add item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add inventory item</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create_name">Name</Label>
                <Input id="create_name" name="name" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create_quantity">Quantity</Label>
                  <Input
                    id="create_quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    defaultValue="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create_unit">Unit</Label>
                  <Input id="create_unit" name="unit" placeholder="bottles, rolls" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create_category">Category</Label>
                  <Input id="create_category" name="category" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create_threshold">Low stock threshold</Label>
                  <Input
                    id="create_threshold"
                    name="low_stock_threshold"
                    type="number"
                    min="0"
                  />
                </div>
              </div>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create item"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-left text-white/60">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Quantity</th>
              <th className="px-4 py-3 font-medium">Threshold</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-white/5 hover:bg-white/5"
              >
                <td className="px-4 py-3 font-medium text-white">{item.name}</td>
                <td className="px-4 py-3 text-white/70">
                  {item.category ?? "—"}
                </td>
                <td className="px-4 py-3 text-white/70">
                  {item.quantity} {item.unit ?? ""}
                </td>
                <td className="px-4 py-3 text-white/70">
                  {item.low_stock_threshold ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {isLowStock(item) ? (
                    <Badge variant="warning">Low stock</Badge>
                  ) : (
                    <Badge variant="success">OK</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleRestock(item.id)}
                      disabled={isPending}
                      title="Restock"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Dialog
                      open={editingItem?.id === item.id}
                      onOpenChange={(open) =>
                        setEditingItem(open ? item : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button size="icon-sm" variant="ghost" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit item</DialogTitle>
                        </DialogHeader>
                        <form action={handleUpdate} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit_name">Name</Label>
                            <Input
                              id="edit_name"
                              name="name"
                              defaultValue={item.name}
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit_quantity">Quantity</Label>
                              <Input
                                id="edit_quantity"
                                name="quantity"
                                type="number"
                                min="0"
                                defaultValue={item.quantity}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit_unit">Unit</Label>
                              <Input
                                id="edit_unit"
                                name="unit"
                                defaultValue={item.unit ?? ""}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit_category">Category</Label>
                              <Input
                                id="edit_category"
                                name="category"
                                defaultValue={item.category ?? ""}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit_threshold">
                                Low stock threshold
                              </Label>
                              <Input
                                id="edit_threshold"
                                name="low_stock_threshold"
                                type="number"
                                min="0"
                                defaultValue={item.low_stock_threshold ?? ""}
                              />
                            </div>
                          </div>
                          <Button type="submit" disabled={isPending}>
                            Save changes
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleDelete(item.id)}
                      disabled={isPending}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <p className="px-4 py-12 text-center text-sm text-white/50">
            No inventory items yet.
          </p>
        )}
      </div>
    </div>
  );
}

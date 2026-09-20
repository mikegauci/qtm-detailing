"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createInventoryItem,
  deleteInventoryItem,
  restockInventoryItem,
  updateInventoryItem,
} from "@/app/actions/admin/inventory";
import {
  AdminDataTable,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
} from "@/components/admin/admin-data-table";
import { InventoryItemFields } from "@/components/admin/inventory-item-fields";
import { SubmitButton } from "@/components/ui/submit-button";
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
              <InventoryItemFields idPrefix="create" />
              <SubmitButton
                isPending={isPending}
                label="Create item"
              />
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <AdminDataTable
        isEmpty={items.length === 0}
        emptyMessage="No inventory items yet."
      >
        <AdminTableHead>
          <AdminTableHeaderCell>Name</AdminTableHeaderCell>
          <AdminTableHeaderCell>Category</AdminTableHeaderCell>
          <AdminTableHeaderCell>Quantity</AdminTableHeaderCell>
          <AdminTableHeaderCell>Threshold</AdminTableHeaderCell>
          <AdminTableHeaderCell>Status</AdminTableHeaderCell>
          <AdminTableHeaderCell>Actions</AdminTableHeaderCell>
        </AdminTableHead>
        <tbody>
          {items.map((item) => (
            <AdminTableRow key={item.id}>
              <AdminTableCell className="font-medium text-white">
                {item.name}
              </AdminTableCell>
              <AdminTableCell className="text-white/70">
                {item.category ?? "—"}
              </AdminTableCell>
              <AdminTableCell className="text-white/70">
                {item.quantity} {item.unit ?? ""}
              </AdminTableCell>
              <AdminTableCell className="text-white/70">
                {item.low_stock_threshold ?? "—"}
              </AdminTableCell>
              <AdminTableCell>
                {isLowStock(item) ? (
                  <Badge variant="warning">Low stock</Badge>
                ) : (
                  <Badge variant="success">OK</Badge>
                )}
              </AdminTableCell>
              <AdminTableCell>
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
                          <InventoryItemFields idPrefix="edit" item={item} />
                          <SubmitButton
                            isPending={isPending}
                            label="Save changes"
                          />
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
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </tbody>
      </AdminDataTable>
    </div>
  );
}

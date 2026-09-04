"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteTestimonial, upsertTestimonial } from "@/app/actions/admin/cms";
import type { Tables } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type TestimonialsEditorProps = {
  initialTestimonials: Tables<"reviews">[];
};

type TestimonialFormState = {
  id?: string;
  customer_name: string;
  vehicle: string;
  comment: string;
  rating: number;
  is_published: boolean;
};

const empty: TestimonialFormState = {
  customer_name: "",
  vehicle: "",
  comment: "",
  rating: 5,
  is_published: true,
};

export function TestimonialsEditor({
  initialTestimonials,
}: TestimonialsEditorProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialTestimonials);
  const [editing, setEditing] = useState<TestimonialFormState>(empty);
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await upsertTestimonial({
        id: editing.id,
        customer_name: editing.customer_name,
        vehicle: editing.vehicle,
        comment: editing.comment,
        rating: Number(editing.rating),
        is_published: editing.is_published,
      });
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else toast.error(result.message);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    startTransition(async () => {
      const result = await deleteTestimonial(id);
      if (result.success) {
        toast.success(result.message);
        setItems((prev) => prev.filter((t) => t.id !== id));
      } else toast.error(result.message);
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Testimonials</h2>
          <Button size="sm" variant="outline" onClick={() => setEditing(empty)}>
            <Plus className="mr-1 h-3 w-3" />
            New
          </Button>
        </div>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              setEditing({
                id: item.id,
                customer_name: item.customer_name ?? "",
                vehicle: item.vehicle ?? "",
                comment: item.comment ?? "",
                rating: item.rating,
                is_published: item.is_published,
              })
            }
            className="w-full rounded-lg border border-white/10 p-3 text-left hover:bg-white/5"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{item.customer_name}</p>
              {!item.is_published && (
                <Badge variant="outline">Draft</Badge>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-white/60">
              {item.comment}
            </p>
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-xl border border-white/10 p-5"
      >
        <h2 className="text-lg font-semibold">
          {editing.id ? "Edit testimonial" : "New testimonial"}
        </h2>
        <div className="space-y-2">
          <Label>Customer name</Label>
          <Input
            value={editing.customer_name}
            onChange={(e) =>
              setEditing((p) => ({ ...p, customer_name: e.target.value }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Vehicle</Label>
          <Input
            value={editing.vehicle ?? ""}
            onChange={(e) =>
              setEditing((p) => ({ ...p, vehicle: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Quote</Label>
          <Textarea
            value={editing.comment ?? ""}
            onChange={(e) =>
              setEditing((p) => ({ ...p, comment: e.target.value }))
            }
            rows={4}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Rating (1-5)</Label>
          <Input
            type="number"
            min={1}
            max={5}
            value={editing.rating}
            onChange={(e) =>
              setEditing((p) => ({ ...p, rating: Number(e.target.value) }))
            }
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={editing.is_published ?? true}
            onChange={(e) =>
              setEditing((p) => ({ ...p, is_published: e.target.checked }))
            }
          />
          Published on website
        </label>
        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save testimonial"
            )}
          </Button>
          {editing.id && (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDelete(editing.id!)}
              disabled={isPending}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteTestimonial, upsertTestimonial } from "@/app/actions/admin/cms";
import { CmsListEditor } from "@/components/admin/cms-list-editor";
import type { Tables } from "@/lib/supabase/types";
import { useServerAction } from "@/hooks/use-server-action";
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
  const { run, isPending } = useServerAction();
  const [items, setItems] = useState(initialTestimonials);
  const [editing, setEditing] = useState<TestimonialFormState>(empty);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    run(
      () =>
        upsertTestimonial({
          id: editing.id,
          customer_name: editing.customer_name,
          vehicle: editing.vehicle,
          comment: editing.comment,
          rating: Number(editing.rating),
          is_published: editing.is_published,
        }),
      { refresh: true },
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    run(() => deleteTestimonial(id), {
      onSuccess: () => setItems((prev) => prev.filter((t) => t.id !== id)),
    });
  };

  return (
    <CmsListEditor
      listTitle="Testimonials"
      formTitle={editing.id ? "Edit testimonial" : "New testimonial"}
      onNew={() => setEditing(empty)}
      list={
        <>
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
        </>
      }
      form={
        <form onSubmit={handleSave} className="space-y-4">
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
      }
    />
  );
}

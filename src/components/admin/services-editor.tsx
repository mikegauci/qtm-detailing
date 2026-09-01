"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteService, upsertService } from "@/app/actions/admin/cms";
import type { Tables } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type ServicesEditorProps = {
  initialServices: Tables<"services">[];
};

type ServiceFormState = {
  id?: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  featured: boolean;
  featuresText: string;
  image_url: string;
  category: string;
  is_active: boolean;
  sort_order: number;
};

const emptyService: ServiceFormState = {
  name: "",
  slug: "",
  short_description: "",
  description: "",
  featured: false,
  featuresText: "",
  image_url: "",
  category: "standard",
  is_active: true,
  sort_order: 0,
};

export function ServicesEditor({ initialServices }: ServicesEditorProps) {
  const [services, setServices] = useState(initialServices);
  const [editing, setEditing] = useState<ServiceFormState>(emptyService);
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await upsertService({
        id: editing.id,
        name: editing.name,
        slug: editing.slug,
        short_description: editing.short_description,
        description: editing.description,
        featured: editing.featured,
        features: editing.featuresText
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
        image_url: editing.image_url,
        category: editing.category,
        is_active: editing.is_active,
        sort_order: Number(editing.sort_order),
      });

      if (result.success) {
        toast.success(result.message);
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this service?")) return;
    startTransition(async () => {
      const result = await deleteService(id);
      if (result.success) {
        toast.success(result.message);
        setServices((prev) => prev.filter((s) => s.id !== id));
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Services</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditing(emptyService)}
          >
            <Plus className="mr-1 h-3 w-3" />
            New
          </Button>
        </div>
        {services.map((service) => (
          <button
            key={service.id}
            type="button"
            onClick={() =>
              setEditing({
                id: service.id,
                name: service.name,
                slug: service.slug,
                short_description: service.short_description ?? "",
                description: service.description ?? "",
                featured: service.featured,
                featuresText: (service.features ?? []).join("\n"),
                image_url: service.image_url ?? "",
                category: service.category ?? "standard",
                is_active: service.is_active,
                sort_order: service.sort_order,
              })
            }
            className="flex w-full items-center justify-between rounded-lg border border-white/10 p-3 text-left hover:bg-white/5"
          >
            <div>
              <p className="font-medium">{service.name}</p>
              <p className="text-sm text-white/60">{service.slug}</p>
            </div>
            <div className="flex items-center gap-2">
              {service.featured && <Badge>Featured</Badge>}
              {!service.is_active && (
                <Badge variant="outline">Inactive</Badge>
              )}
            </div>
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-xl border border-white/10 p-5"
      >
        <h2 className="text-lg font-semibold">
          {editing.id ? "Edit service" : "New service"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={editing.name}
              onChange={(e) =>
                setEditing((p) => ({ ...p, name: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              value={editing.slug}
              onChange={(e) =>
                setEditing((p) => ({ ...p, slug: e.target.value }))
              }
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Short description</Label>
          <Textarea
            value={editing.short_description ?? ""}
            onChange={(e) =>
              setEditing((p) => ({ ...p, short_description: e.target.value }))
            }
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={editing.description ?? ""}
            onChange={(e) =>
              setEditing((p) => ({ ...p, description: e.target.value }))
            }
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label>Sort order</Label>
          <Input
            type="number"
            value={editing.sort_order ?? 0}
            onChange={(e) =>
              setEditing((p) => ({
                ...p,
                sort_order: Number(e.target.value),
              }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Image URL</Label>
          <Input
            value={editing.image_url ?? ""}
            onChange={(e) =>
              setEditing((p) => ({ ...p, image_url: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Features (one per line)</Label>
          <Textarea
            value={editing.featuresText}
            onChange={(e) =>
              setEditing((p) => ({ ...p, featuresText: e.target.value }))
            }
            rows={5}
          />
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editing.featured ?? false}
              onChange={(e) =>
                setEditing((p) => ({ ...p, featured: e.target.checked }))
              }
            />
            Featured
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editing.is_active ?? true}
              onChange={(e) =>
                setEditing((p) => ({ ...p, is_active: e.target.checked }))
              }
            />
            Active
          </label>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save service"
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

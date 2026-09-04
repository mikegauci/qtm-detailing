"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteService,
  reorderServices,
  upsertService,
} from "@/app/actions/admin/cms";
import { CmsImageField } from "@/components/admin/cms-image-field";
import type { Tables } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn, slugify } from "@/lib/utils";

type ServicesEditorProps = {
  initialServices: Tables<"services">[];
};

type ServiceFormState = {
  id?: string;
  name: string;
  short_description: string;
  description: string;
  featuresText: string;
  image_url: string;
  category: string;
  is_active: boolean;
};

const emptyService: ServiceFormState = {
  name: "",
  short_description: "",
  description: "",
  featuresText: "",
  image_url: "",
  category: "standard",
  is_active: true,
};

function SortableServiceRow({
  service,
  isSelected,
  onSelect,
}: {
  service: Tables<"services">;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-white/10 bg-surface-base",
        isSelected && "border-brand-purple-400/40 bg-white/5",
        isDragging && "opacity-60",
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none px-2 py-3 text-white/40 hover:text-white/70 active:cursor-grabbing"
        aria-label={`Reorder ${service.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center justify-between py-3 pr-3 text-left hover:bg-white/5"
      >
        <div className="min-w-0">
          <p className="truncate font-medium">{service.name}</p>
          <p className="truncate text-sm text-white/60">
            {slugify(service.name)}
          </p>
        </div>
        {!service.is_active && <Badge variant="outline">Inactive</Badge>}
      </button>
    </div>
  );
}

export function ServicesEditor({ initialServices }: ServicesEditorProps) {
  const [services, setServices] = useState(initialServices);
  const [editing, setEditing] = useState<ServiceFormState>(emptyService);
  const [isPending, startTransition] = useTransition();
  const link = slugify(editing.name);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = services.findIndex((service) => service.id === active.id);
    const newIndex = services.findIndex((service) => service.id === over.id);
    const previous = services;
    const reordered = arrayMove(services, oldIndex, newIndex);

    setServices(reordered);

    startTransition(async () => {
      const result = await reorderServices(reordered.map((service) => service.id));
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
        setServices(previous);
      }
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await upsertService({
        id: editing.id,
        name: editing.name,
        short_description: editing.short_description,
        description: editing.description,
        features: editing.featuresText
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
        image_url: editing.image_url,
        category: editing.category,
        is_active: editing.is_active,
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

  const selectService = (service: Tables<"services">) => {
    setEditing({
      id: service.id,
      name: service.name,
      short_description: service.short_description ?? "",
      description: service.description ?? "",
      featuresText: (service.features ?? []).join("\n"),
      image_url: service.image_url ?? "",
      category: service.category ?? "standard",
      is_active: service.is_active,
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Services</h2>
            <p className="text-sm text-white/50">Drag to reorder</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditing(emptyService)}
          >
            <Plus className="mr-1 h-3 w-3" />
            New
          </Button>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={services.map((service) => service.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {services.map((service) => (
                <SortableServiceRow
                  key={service.id}
                  service={service}
                  isSelected={editing.id === service.id}
                  onSelect={() => selectService(service)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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
            <Label>Link</Label>
            <Input
              value={link}
              readOnly
              tabIndex={-1}
              className="cursor-default bg-white/5 text-white/60"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Short description <small className="text-xs text-white/50">(shown on homepage)</small></Label>
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
        <CmsImageField
          label="Service image"
          value={editing.image_url ?? ""}
          onChange={(url) => setEditing((p) => ({ ...p, image_url: url }))}
          folder="services"
          filename={link || undefined}
        />
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
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={editing.is_active ?? true}
            onChange={(e) =>
              setEditing((p) => ({ ...p, is_active: e.target.checked }))
            }
          />
          Active
        </label>
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

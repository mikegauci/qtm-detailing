"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  type DraggableAttributes,
} from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  deleteService,
  reorderServices,
  upsertService,
} from "@/app/actions/admin/cms";
import { CmsFormActions } from "@/components/admin/cms-form-actions";
import { CmsListEditor } from "@/components/admin/cms-list-editor";
import { ServiceImagesField } from "@/components/admin/service-images-field";
import { parseServiceImages } from "@/lib/content/service-images";
import { useMounted } from "@/hooks/use-mounted";
import { useServerAction } from "@/hooks/use-server-action";
import { useSortableSensors } from "@/hooks/use-sortable-sensors";
import type { ServiceImage } from "@/types/content";
import type { Tables } from "@/lib/supabase/types";
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
  title_subline: string;
  short_description: string;
  description: string;
  featuresText: string;
  images: ServiceImage[];
  category: string;
  is_active: boolean;
};

const emptyService: ServiceFormState = {
  name: "",
  title_subline: "",
  short_description: "",
  description: "",
  featuresText: "",
  images: [],
  category: "standard",
  is_active: true,
};

function ServiceRowCard({
  service,
  isSelected,
  onSelect,
  dragHandle,
}: {
  service: Tables<"services">;
  isSelected: boolean;
  onSelect: () => void;
  dragHandle?: {
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
  };
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-white/10 bg-surface-base",
        isSelected && "border-brand-purple-400/40 bg-white/5",
      )}
    >
      {dragHandle ? (
        <button
          type="button"
          className="cursor-grab touch-none px-2 py-3 text-white/40 hover:text-white/70 active:cursor-grabbing"
          aria-label={`Reorder ${service.name}`}
          {...dragHandle.attributes}
          {...dragHandle.listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      ) : (
        <div className="px-2 py-3 text-white/20">
          <GripVertical className="h-4 w-4" />
        </div>
      )}
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center justify-between py-3 pr-3 text-left hover:bg-white/5"
      >
        <div className="min-w-0">
          <p className="truncate font-medium">{service.name}</p>
          <p className="truncate text-sm text-white/60">
            {service.title_subline || slugify(service.name)}
          </p>
        </div>
        {!service.is_active && <Badge variant="outline">Inactive</Badge>}
      </button>
    </div>
  );
}

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
      className={cn(isDragging && "opacity-60")}
    >
      <ServiceRowCard
        service={service}
        isSelected={isSelected}
        onSelect={onSelect}
        dragHandle={{ attributes, listeners }}
      />
    </div>
  );
}

export function ServicesEditor({ initialServices }: ServicesEditorProps) {
  const { run, isPending, startTransition } = useServerAction();
  const [services, setServices] = useState(initialServices);
  const [editing, setEditing] = useState<ServiceFormState>(emptyService);
  const mounted = useMounted();
  const link = slugify(editing.name);

  const sensors = useSortableSensors();

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
    run(
      () =>
        upsertService({
          id: editing.id,
          name: editing.name,
          title_subline: editing.title_subline,
          short_description: editing.short_description,
          description: editing.description,
          features: editing.featuresText
            .split("\n")
            .map((f) => f.trim())
            .filter(Boolean),
          images: editing.images,
          category: editing.category,
          is_active: editing.is_active,
        }),
      { refresh: true },
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this service?")) return;
    run(() => deleteService(id), {
      onSuccess: () => setServices((prev) => prev.filter((s) => s.id !== id)),
    });
  };

  const selectService = (service: Tables<"services">) => {
    setEditing({
      id: service.id,
      name: service.name,
      title_subline: service.title_subline ?? "",
      short_description: service.short_description ?? "",
      description: service.description ?? "",
      featuresText: (service.features ?? []).join("\n"),
      images: parseServiceImages(service.images, service.image_url),
      category: service.category ?? "standard",
      is_active: service.is_active,
    });
  };

  const serviceList = mounted ? (
    <DndContext
      id="services-editor-list"
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
  ) : (
    <div className="space-y-2">
      {services.map((service) => (
        <ServiceRowCard
          key={service.id}
          service={service}
          isSelected={editing.id === service.id}
          onSelect={() => selectService(service)}
        />
      ))}
    </div>
  );

  return (
    <CmsListEditor
      listTitle="Services"
      listSubtitle="Drag to reorder"
      formTitle={editing.id ? "Edit service" : "New service"}
      onNew={() => setEditing(emptyService)}
      list={serviceList}
      form={
        <form onSubmit={handleSave} className="space-y-4">
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
            <Label>
              Subtitle
            </Label>
            <Input
              value={editing.title_subline}
              onChange={(e) =>
                setEditing((p) => ({ ...p, title_subline: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>
              Short description{" "}
              <small className="text-xs text-white/50">(shown on homepage)</small>
            </Label>
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
          <ServiceImagesField
            value={editing.images}
            onChange={(images) => setEditing((p) => ({ ...p, images }))}
            slug={link}
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
          <CmsFormActions
            isPending={isPending}
            saveLabel="Save service"
            onDelete={editing.id ? () => handleDelete(editing.id!) : undefined}
          />
        </form>
      }
    />
  );
}

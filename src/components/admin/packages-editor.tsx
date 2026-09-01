"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteComparisonFeature,
  upsertComparisonFeature,
  upsertPackage,
} from "@/app/actions/admin/cms";
import type { Tables } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type PackagesEditorProps = {
  initialPackages: Tables<"packages">[];
  initialFeatures: Tables<"comparison_features">[];
};

export function PackagesEditor({
  initialPackages,
  initialFeatures,
}: PackagesEditorProps) {
  const [packages, setPackages] = useState(initialPackages);
  const [features, setFeatures] = useState(initialFeatures);
  const [selectedId, setSelectedId] = useState<string | undefined>(
    initialPackages[0]?.id,
  );
  const [isPending, startTransition] = useTransition();

  const selected = packages.find((p) => p.id === selectedId);
  const featureCount = features.length;

  const updateSelected = (patch: Partial<Tables<"packages">>) => {
    if (!selectedId) return;
    setPackages((prev) =>
      prev.map((p) => (p.id === selectedId ? { ...p, ...patch } : p)),
    );
  };

  const toggleInclude = (index: number) => {
    if (!selected) return;
    const includes = [...(selected.includes as boolean[])];
    while (includes.length < featureCount) includes.push(false);
    includes[index] = !includes[index];
    updateSelected({ includes });
  };

  const handleSavePackage = () => {
    if (!selected) return;
    startTransition(async () => {
      const result = await upsertPackage({
        id: selected.id.startsWith("new-") ? undefined : selected.id,
        name: selected.name,
        price: Number(selected.price),
        description: selected.description ?? undefined,
        is_popular: selected.is_popular,
        features: selected.features ?? [],
        includes: (selected.includes as boolean[]) ?? [],
        sort_order: selected.sort_order,
        is_active: selected.is_active,
      });
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  };

  const handleAddPackage = () => {
    const includes = features.map(() => false);
    const draft: Tables<"packages"> = {
      id: `new-${Date.now()}`,
      name: "New Package",
      price: 0,
      description: "",
      is_popular: false,
      features: [],
      includes,
      sort_order: packages.length,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setPackages((prev) => [...prev, draft]);
    setSelectedId(draft.id);
  };

  const handleAddFeature = () => {
    startTransition(async () => {
      const result = await upsertComparisonFeature({
        label: "New feature",
        sort_order: features.length,
      });
      if (result.success) {
        toast.success(result.message);
        window.location.reload();
      } else toast.error(result.message);
    });
  };

  const handleSaveFeature = (feature: Tables<"comparison_features">) => {
    startTransition(async () => {
      const result = await upsertComparisonFeature({
        id: feature.id,
        label: feature.label,
        sort_order: feature.sort_order,
      });
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  };

  const handleDeleteFeature = (id: string) => {
    if (!confirm("Delete this comparison feature?")) return;
    startTransition(async () => {
      const result = await deleteComparisonFeature(id);
      if (result.success) {
        toast.success(result.message);
        setFeatures((prev) => prev.filter((f) => f.id !== id));
      } else toast.error(result.message);
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Packages</h2>
            <Button size="sm" variant="outline" onClick={handleAddPackage}>
              <Plus className="mr-1 h-3 w-3" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setSelectedId(pkg.id)}
                className={`flex w-full items-center justify-between rounded-lg border p-3 text-left ${
                  selectedId === pkg.id
                    ? "border-brand-purple-400 bg-brand-purple-400/10"
                    : "border-white/10 hover:bg-white/5"
                }`}
              >
                <span>{pkg.name}</span>
                {pkg.is_popular && <Badge>Popular</Badge>}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Comparison features</h2>
            <Button size="sm" variant="outline" onClick={handleAddFeature}>
              <Plus className="mr-1 h-3 w-3" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="flex items-center gap-2 rounded-lg border border-white/10 p-2"
              >
                <Input
                  value={feature.label}
                  onChange={(e) =>
                    setFeatures((prev) =>
                      prev.map((f) =>
                        f.id === feature.id
                          ? { ...f, label: e.target.value }
                          : f,
                      ),
                    )
                  }
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSaveFeature(feature)}
                  disabled={isPending}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteFeature(feature.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div className="space-y-4 rounded-xl border border-white/10 p-5">
          <h2 className="text-lg font-semibold">Edit package</h2>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={selected.name}
              onChange={(e) => updateSelected({ name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Price</Label>
            <Input
              type="number"
              value={selected.price}
              onChange={(e) =>
                updateSelected({ price: Number(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={selected.description ?? ""}
              onChange={(e) => updateSelected({ description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Feature bullets (one per line)</Label>
            <Textarea
              value={(selected.features ?? []).join("\n")}
              onChange={(e) =>
                updateSelected({
                  features: e.target.value
                    .split("\n")
                    .map((f) => f.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Comparison matrix</Label>
            {features.map((feature, index) => {
              const includes = (selected.includes as boolean[]) ?? [];
              return (
                <label
                  key={feature.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={includes[index] ?? false}
                    onChange={() => toggleInclude(index)}
                  />
                  {feature.label}
                </label>
              );
            })}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.is_popular}
              onChange={(e) =>
                updateSelected({ is_popular: e.target.checked })
              }
            />
            Mark as popular
          </label>
          <Button onClick={handleSavePackage} disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save package"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

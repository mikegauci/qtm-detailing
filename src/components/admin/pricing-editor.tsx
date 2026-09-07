"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronRight,
  GripVertical,
  LayoutTemplate,
  List,
  Plus,
  Search,
  Settings2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  deletePricingItem,
  deletePricingSection,
  reorderPricingItems,
  reorderPricingSections,
  upsertPricingItem,
  upsertPricingSection,
} from "@/app/actions/admin/cms";
import { CmsFormActions } from "@/components/admin/cms-form-actions";
import { EditorTabBar } from "@/components/admin/editor-tab-bar";
import { PageSeoFields } from "@/components/admin/page-seo-fields";
import { SaveSectionButton } from "@/components/admin/save-section-button";
import { SectionHeadingFields } from "@/components/admin/section-heading-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMounted } from "@/hooks/use-mounted";
import { usePageSectionSave } from "@/hooks/use-page-section-save";
import { useServerAction } from "@/hooks/use-server-action";
import { useSortableSensors } from "@/hooks/use-sortable-sensors";
import type { Tables } from "@/lib/supabase/types";
import type { PageSeoContent } from "@/types/page-sections";
import type {
  PriceTier,
  PricingHero,
  PricingImportantInfo,
} from "@/types/pricing";
import { cn, formatPrice, slugify } from "@/lib/utils";

type PricingSectionRow = Tables<"pricing_sections"> & {
  items: Tables<"pricing_items">[];
};

export type PricingEditorProps = {
  initialSections: PricingSectionRow[];
  hero: PricingHero;
  importantInfo: PricingImportantInfo;
  seo: PageSeoContent;
};

type PricingTab = "hero" | "cards" | "important-info" | "seo";

type CardsView = "items" | "section-settings";

type SectionFormState = {
  id?: string;
  heading: string;
  intro: string;
};

type ItemFormState = {
  id?: string;
  section_id: string;
  title: string;
  description: string;
  tiers: PriceTier[];
  includesText: string;
  note: string;
  warning: string;
};

const emptySection: SectionFormState = {
  heading: "",
  intro: "",
};

const emptyItem = (sectionId: string): ItemFormState => ({
  section_id: sectionId,
  title: "",
  description: "",
  tiers: [{ label: "From", price: 0 }],
  includesText: "",
  note: "",
  warning: "",
});

function parseTiers(value: unknown): PriceTier[] {
  if (!Array.isArray(value)) return [{ label: "From", price: 0 }];
  const tiers = value
    .filter(
      (tier): tier is PriceTier =>
        typeof tier === "object" &&
        tier !== null &&
        typeof (tier as PriceTier).label === "string" &&
        typeof (tier as PriceTier).price === "number",
    )
    .map((tier) => ({ label: tier.label, price: tier.price }));
  return tiers.length ? tiers : [{ label: "From", price: 0 }];
}

function itemPriceSummary(tiers: unknown): string {
  const parsed = parseTiers(tiers);
  if (!parsed.length) return "No prices";
  const prices = parsed.map((tier) => tier.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (parsed.length === 1) return `From ${formatPrice(min)}`;
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} – ${formatPrice(max)}`;
}

function SortableItemRow({
  item,
  isSelected,
  onSelect,
}: {
  item: Tables<"pricing_items">;
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
  } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(isDragging && "opacity-60")}
    >
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-white/10 bg-surface-base",
          isSelected && "border-brand-purple-400/40 bg-white/5",
        )}
      >
        <button
          type="button"
          className="cursor-grab touch-none px-2 py-3 text-white/40 hover:text-white/70 active:cursor-grabbing"
          aria-label={`Reorder ${item.title}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 py-3 pr-3 text-left hover:bg-white/5"
        >
          <p className="truncate font-medium">{item.title}</p>
          <span className="shrink-0 text-xs text-brand-cyan-400">
            {itemPriceSummary(item.tiers)}
          </span>
        </button>
      </div>
    </div>
  );
}

function StaticItemRow({
  item,
  isSelected,
  onSelect,
}: {
  item: Tables<"pricing_items">;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-white/10 bg-surface-base",
        isSelected && "border-brand-purple-400/40 bg-white/5",
      )}
    >
      <div className="px-2 py-3 text-white/20">
        <GripVertical className="h-4 w-4" />
      </div>
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center justify-between gap-3 py-3 pr-3 text-left hover:bg-white/5"
      >
        <p className="truncate font-medium">{item.title}</p>
        <span className="shrink-0 text-xs text-brand-cyan-400">
          {itemPriceSummary(item.tiers)}
        </span>
      </button>
    </div>
  );
}

function SortableSectionNav({
  section,
  isActive,
  onSelect,
}: {
  section: PricingSectionRow;
  isActive: boolean;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(isDragging && "opacity-60")}
    >
      <div
        className={cn(
          "flex items-center gap-1 rounded-lg border transition-colors",
          isActive
            ? "border-brand-purple-400/40 bg-brand-purple-500/10"
            : "border-white/10 bg-surface-base hover:border-white/20",
        )}
      >
        <button
          type="button"
          className="cursor-grab touch-none px-2 py-2.5 text-white/40 hover:text-white/70 active:cursor-grabbing"
          aria-label={`Reorder ${section.heading ?? section.slug}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-center justify-between gap-2 py-2.5 pr-3 text-left"
        >
          <span className="truncate text-sm font-medium">
            {section.heading || section.slug}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-xs text-white/50">
            {section.items.length}
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                isActive && "rotate-90 text-brand-purple-300",
              )}
            />
          </span>
        </button>
      </div>
    </div>
  );
}

function TierFields({
  tiers,
  onChange,
}: {
  tiers: PriceTier[];
  onChange: (tiers: PriceTier[]) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Price tiers</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onChange([...tiers, { label: "From", price: 0 }])}
        >
          <Plus className="mr-1 h-3 w-3" />
          Add tier
        </Button>
      </div>
      <div className="space-y-2">
        {tiers.map((tier, index) => (
          <div key={index} className="flex items-end gap-2">
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs text-white/50">Size label</Label>
                <Input
                  placeholder="e.g. Small (S)"
                  value={tier.label}
                  onChange={(e) => {
                    const next = [...tiers];
                    next[index] = { ...tier, label: e.target.value };
                    onChange(next);
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-white/50">Price (EUR)</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={tier.price}
                  onChange={(e) => {
                    const next = [...tiers];
                    next[index] = {
                      ...tier,
                      price: Number(e.target.value) || 0,
                    };
                    onChange(next);
                  }}
                />
              </div>
            </div>
            <Button
              type="button"
              size="icon"
              variant="outline"
              disabled={tiers.length <= 1}
              onClick={() => onChange(tiers.filter((_, i) => i !== index))}
              aria-label="Remove tier"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PricingEditor({
  initialSections,
  hero,
  importantInfo,
  seo,
}: PricingEditorProps) {
  const [activeTab, setActiveTab] = useState<PricingTab>("hero");
  const [sections, setSections] = useState(initialSections);
  const [heroContent, setHeroContent] = useState(hero);
  const [importantInfoContent, setImportantInfoContent] =
    useState(importantInfo);
  const [seoContent, setSeoContent] = useState(seo);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    initialSections[0]?.id ?? null,
  );
  const [cardsView, setCardsView] = useState<CardsView>("items");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingSection, setEditingSection] =
    useState<SectionFormState>(emptySection);
  const [editingItem, setEditingItem] = useState<ItemFormState | null>(null);
  const [isCreatingSection, setIsCreatingSection] = useState(false);

  const { run, isPending, startTransition } = useServerAction();
  const { save, isSaving } = usePageSectionSave();
  const mounted = useMounted();
  const sensors = useSortableSensors();

  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeSectionId) ?? null,
    [sections, activeSectionId],
  );

  const selectedItem = useMemo(() => {
    if (!selectedItemId || !activeSection) return null;
    return activeSection.items.find((item) => item.id === selectedItemId) ?? null;
  }, [activeSection, selectedItemId]);

  const openSection = (section: PricingSectionRow) => {
    setActiveSectionId(section.id);
    setCardsView("items");
    setSelectedItemId(null);
    setEditingItem(null);
    setIsCreatingSection(false);
  };

  const openSectionSettings = (section: PricingSectionRow) => {
    setActiveSectionId(section.id);
    setCardsView("section-settings");
    setSelectedItemId(null);
    setEditingItem(null);
    setIsCreatingSection(false);
    setEditingSection({
      id: section.id,
      heading: section.heading ?? "",
      intro: section.intro ?? "",
    });
  };

  const openNewSection = () => {
    setActiveSectionId(null);
    setCardsView("section-settings");
    setSelectedItemId(null);
    setEditingItem(null);
    setIsCreatingSection(true);
    setEditingSection(emptySection);
  };

  const openItem = (item: Tables<"pricing_items">) => {
    setCardsView("items");
    setSelectedItemId(item.id);
    setEditingItem({
      id: item.id,
      section_id: item.section_id,
      title: item.title,
      description: item.description,
      tiers: parseTiers(item.tiers),
      includesText: (item.includes ?? []).join("\n"),
      note: item.note ?? "",
      warning: item.warning ?? "",
    });
  };

  const openNewItem = () => {
    if (!activeSection) return;
    setCardsView("items");
    setSelectedItemId(null);
    setEditingItem(emptyItem(activeSection.id));
  };

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((section) => section.id === active.id);
    const newIndex = sections.findIndex((section) => section.id === over.id);
    const previous = sections;
    const reordered = arrayMove(sections, oldIndex, newIndex);

    setSections(reordered);

    startTransition(async () => {
      const result = await reorderPricingSections(
        reordered.map((section) => section.id),
      );
      if (result.success) toast.success(result.message);
      else {
        toast.error(result.message);
        setSections(previous);
      }
    });
  };

  const handleItemDragEnd = (event: DragEndEvent) => {
    if (!activeSection) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = activeSection.items.findIndex(
      (item) => item.id === active.id,
    );
    const newIndex = activeSection.items.findIndex(
      (item) => item.id === over.id,
    );
    const reorderedItems = arrayMove(activeSection.items, oldIndex, newIndex);
    const previous = sections;

    setSections((prev) =>
      prev.map((section) =>
        section.id === activeSection.id
          ? { ...section, items: reorderedItems }
          : section,
      ),
    );

    startTransition(async () => {
      const result = await reorderPricingItems(
        reorderedItems.map((item) => item.id),
      );
      if (result.success) toast.success(result.message);
      else {
        toast.error(result.message);
        setSections(previous);
      }
    });
  };

  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    run(
      () =>
        upsertPricingSection({
          id: editingSection.id,
          slug: slugify(editingSection.heading),
          heading: editingSection.heading,
          intro: editingSection.intro,
        }),
      {
        refresh: true,
        onSuccess: () => {
          setIsCreatingSection(false);
          setCardsView("items");
        },
      },
    );
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    run(
      () =>
        upsertPricingItem({
          id: editingItem.id,
          section_id: editingItem.section_id,
          title: editingItem.title,
          slug: slugify(editingItem.title),
          description: editingItem.description,
          tiers: editingItem.tiers,
          includes: editingItem.includesText
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
          note: editingItem.note || undefined,
          warning: editingItem.warning || undefined,
        }),
      { refresh: true },
    );
  };

  const handleDeleteSection = (id: string) => {
    if (!confirm("Delete this section and all its pricing cards?")) return;
    run(() => deletePricingSection(id), {
      onSuccess: () => {
        setSections((prev) => prev.filter((section) => section.id !== id));
        if (activeSectionId === id) {
          const next = sections.find((section) => section.id !== id);
          setActiveSectionId(next?.id ?? null);
          setCardsView("items");
          setSelectedItemId(null);
          setEditingItem(null);
          setEditingSection(emptySection);
        }
      },
    });
  };

  const handleDeleteItem = (id: string) => {
    if (!confirm("Delete this pricing card?")) return;
    run(() => deletePricingItem(id), {
      onSuccess: () => {
        setSections((prev) =>
          prev.map((section) => ({
            ...section,
            items: section.items.filter((item) => item.id !== id),
          })),
        );
        if (selectedItemId === id) {
          setSelectedItemId(null);
          setEditingItem(null);
        }
      },
    });
  };

  const sectionNav = mounted ? (
    <DndContext
      id="pricing-section-nav"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleSectionDragEnd}
    >
      <SortableContext
        items={sections.map((section) => section.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-1.5">
          {sections.map((section) => (
            <SortableSectionNav
              key={section.id}
              section={section}
              isActive={activeSectionId === section.id}
              onSelect={() => openSection(section)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  ) : (
    <div className="space-y-1.5">
      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => openSection(section)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors",
            activeSectionId === section.id
              ? "border-brand-purple-400/40 bg-brand-purple-500/10"
              : "border-white/10 bg-surface-base hover:border-white/20",
          )}
        >
          <span className="truncate">{section.heading || section.slug}</span>
          <span className="text-xs text-white/50">{section.items.length}</span>
        </button>
      ))}
    </div>
  );

  const itemList =
    activeSection && mounted ? (
      <DndContext
        id={`pricing-items-${activeSection.id}`}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleItemDragEnd}
      >
        <SortableContext
          items={activeSection.items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {activeSection.items.map((item) => (
              <SortableItemRow
                key={item.id}
                item={item}
                isSelected={selectedItemId === item.id}
                onSelect={() => openItem(item)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    ) : activeSection ? (
      <div className="space-y-2">
        {activeSection.items.map((item) => (
          <StaticItemRow
            key={item.id}
            item={item}
            isSelected={selectedItemId === item.id}
            onSelect={() => openItem(item)}
          />
        ))}
      </div>
    ) : null;

  return (
    <div className="space-y-6">
      <EditorTabBar
        variant="page"
        value={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: "hero",
            label: "Hero",
            icon: <LayoutTemplate className="h-4 w-4" />,
          },
          {
            id: "cards",
            label: "Pricing cards",
            icon: <List className="h-4 w-4" />,
          },
          {
            id: "important-info",
            label: "Important info",
            icon: <List className="h-4 w-4" />,
          },
          {
            id: "seo",
            label: "SEO",
            icon: <Search className="h-4 w-4" />,
          },
        ]}
      />

      {activeTab === "hero" ? (
        <div className="max-w-2xl space-y-4 rounded-xl border border-white/10 p-5">
          <SectionHeadingFields
            content={heroContent}
            onChange={setHeroContent}
          />
          <SaveSectionButton
            label="Save hero"
            isSaving={isSaving("pricing", "hero")}
            onClick={() => save("pricing", "hero", heroContent)}
          />
        </div>
      ) : null}

      {activeTab === "important-info" ? (
        <div className="max-w-2xl space-y-4 rounded-xl border border-white/10 p-5">
          <div className="space-y-2">
            <Label>Eyebrow</Label>
            <Input
              value={importantInfoContent.eyebrow ?? ""}
              onChange={(e) =>
                setImportantInfoContent((prev) => ({
                  ...prev,
                  eyebrow: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={importantInfoContent.title}
              onChange={(e) =>
                setImportantInfoContent((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Paragraphs (one per line)</Label>
            <Textarea
              rows={4}
              value={importantInfoContent.paragraphs.join("\n")}
              onChange={(e) =>
                setImportantInfoContent((prev) => ({
                  ...prev,
                  paragraphs: e.target.value.split("\n"),
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Bullet points (one per line)</Label>
            <Textarea
              rows={6}
              value={importantInfoContent.bullets.join("\n")}
              onChange={(e) =>
                setImportantInfoContent((prev) => ({
                  ...prev,
                  bullets: e.target.value.split("\n"),
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Closing paragraphs (one per line)</Label>
            <Textarea
              rows={4}
              value={importantInfoContent.closingParagraphs.join("\n")}
              onChange={(e) =>
                setImportantInfoContent((prev) => ({
                  ...prev,
                  closingParagraphs: e.target.value.split("\n"),
                }))
              }
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>CTA label</Label>
              <Input
                value={importantInfoContent.ctaLabel ?? ""}
                onChange={(e) =>
                  setImportantInfoContent((prev) => ({
                    ...prev,
                    ctaLabel: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>CTA link</Label>
              <Input
                value={importantInfoContent.ctaHref ?? ""}
                onChange={(e) =>
                  setImportantInfoContent((prev) => ({
                    ...prev,
                    ctaHref: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <SaveSectionButton
            label="Save important info"
            isSaving={isSaving("pricing", "important-info")}
            onClick={() =>
              save("pricing", "important-info", importantInfoContent)
            }
          />
        </div>
      ) : null}

      {activeTab === "seo" ? (
        <div className="max-w-2xl space-y-4 rounded-xl border border-white/10 p-5">
          <PageSeoFields
            content={seoContent}
            onChange={setSeoContent}
            showNoindex
          />
          <SaveSectionButton
            label="Save SEO"
            isSaving={isSaving("pricing", "seo")}
            onClick={() => save("pricing", "seo", seoContent)}
          />
        </div>
      ) : null}

      {activeTab === "cards" ? (
        <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)_minmax(0,1.2fr)]">
          <aside className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70">
                  Categories
                </h2>
                <p className="text-xs text-white/40">Drag to reorder</p>
              </div>
              <Button size="sm" variant="outline" onClick={openNewSection}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            {sectionNav}
          </aside>

          <section className="space-y-3 rounded-xl border border-white/10 p-4">
            {activeSection ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-brand-purple-300">
                      Pricing cards
                    </p>
                    <h2 className="text-lg font-semibold">
                      {activeSection.heading || activeSection.slug}
                    </h2>
                    {activeSection.intro ? (
                      <p className="mt-1 text-sm text-white/50 line-clamp-2">
                        {activeSection.intro}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openSectionSettings(activeSection)}
                    >
                      <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                      Section settings
                    </Button>
                    <Button size="sm" onClick={openNewItem}>
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Add card
                    </Button>
                  </div>
                </div>

                {activeSection.items.length > 0 ? (
                  <>
                    <p className="text-xs text-white/40">
                      Select a card to edit. Drag to reorder.
                    </p>
                    {itemList}
                  </>
                ) : (
                  <div className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center">
                    <p className="text-sm text-white/50">
                      No pricing cards in this section yet.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={openNewItem}
                    >
                      Add first card
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full min-h-48 items-center justify-center rounded-lg border border-dashed border-white/10 px-4 py-8 text-center">
                <div>
                  <p className="text-sm text-white/50">
                    Choose a category from the left, or create a new one.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={openNewSection}
                  >
                    New category
                  </Button>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-4 rounded-xl border border-white/10 p-5">
            {cardsView === "section-settings" || isCreatingSection ? (
              <>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-white/40">
                    {isCreatingSection ? "New category" : "Section settings"}
                  </p>
                  <h2 className="text-lg font-semibold">
                    {isCreatingSection
                      ? "Create category"
                      : editingSection.heading || "Edit category"}
                  </h2>
                </div>
                <form onSubmit={handleSaveSection} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category name</Label>
                    <Input
                      value={editingSection.heading}
                      onChange={(e) =>
                        setEditingSection((prev) => ({
                          ...prev,
                          heading: e.target.value,
                        }))
                      }
                      placeholder="e.g. Core Detailing"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Intro text (optional)</Label>
                    <Textarea
                      rows={3}
                      value={editingSection.intro}
                      onChange={(e) =>
                        setEditingSection((prev) => ({
                          ...prev,
                          intro: e.target.value,
                        }))
                      }
                      placeholder="Shown below the category heading on the pricing page"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!isCreatingSection && activeSection ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setCardsView("items");
                          setIsCreatingSection(false);
                        }}
                      >
                        Back to cards
                      </Button>
                    ) : null}
                    <CmsFormActions
                      isPending={isPending}
                      saveLabel={
                        isCreatingSection ? "Create category" : "Save settings"
                      }
                      onDelete={
                        editingSection.id
                          ? () => handleDeleteSection(editingSection.id!)
                          : undefined
                      }
                      deleteLabel="Delete category"
                    />
                  </div>
                </form>
              </>
            ) : editingItem ? (
              <>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-white/40">
                    {activeSection?.heading || "Pricing card"}
                  </p>
                  <h2 className="text-lg font-semibold">
                    {editingItem.id ? "Edit card" : "New card"}
                  </h2>
                  {selectedItem ? (
                    <p className="mt-0.5 text-sm text-white/50">
                      {selectedItem.title}
                    </p>
                  ) : null}
                </div>
                <form onSubmit={handleSaveItem} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={editingItem.title}
                      onChange={(e) =>
                        setEditingItem((prev) =>
                          prev ? { ...prev, title: e.target.value } : prev,
                        )
                      }
                      placeholder="e.g. Premium Interior Deep Clean"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      rows={3}
                      value={editingItem.description}
                      onChange={(e) =>
                        setEditingItem((prev) =>
                          prev
                            ? { ...prev, description: e.target.value }
                            : prev,
                        )
                      }
                    />
                  </div>
                  <TierFields
                    tiers={editingItem.tiers}
                    onChange={(tiers) =>
                      setEditingItem((prev) =>
                        prev ? { ...prev, tiers } : prev,
                      )
                    }
                  />
                  <div className="space-y-2">
                    <Label>Includes (one per line)</Label>
                    <Textarea
                      rows={5}
                      value={editingItem.includesText}
                      onChange={(e) =>
                        setEditingItem((prev) =>
                          prev
                            ? { ...prev, includesText: e.target.value }
                            : prev,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Note (optional)</Label>
                    <Textarea
                      rows={2}
                      value={editingItem.note}
                      onChange={(e) =>
                        setEditingItem((prev) =>
                          prev ? { ...prev, note: e.target.value } : prev,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Warning (optional)</Label>
                    <Textarea
                      rows={3}
                      value={editingItem.warning}
                      onChange={(e) =>
                        setEditingItem((prev) =>
                          prev ? { ...prev, warning: e.target.value } : prev,
                        )
                      }
                    />
                  </div>
                  <CmsFormActions
                    isPending={isPending}
                    saveLabel={editingItem.id ? "Save card" : "Create card"}
                    onDelete={
                      editingItem.id
                        ? () => handleDeleteItem(editingItem.id!)
                        : undefined
                    }
                    deleteLabel="Delete card"
                  />
                </form>
              </>
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center text-center">
                <p className="text-sm text-white/50">
                  {activeSection
                    ? "Select a pricing card from the list to edit it."
                    : "Select a category to manage its pricing cards."}
                </p>
                {activeSection ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={() => openSectionSettings(activeSection)}
                  >
                    <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                    Edit category settings
                  </Button>
                ) : null}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}

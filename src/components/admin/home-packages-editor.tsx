"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import {
  saveHomePackagesSection,
  type AdminPackageFormState,
} from "@/app/actions/admin/cms";
import { SaveSectionButton } from "@/components/admin/save-section-button";
import { SectionHeadingFields } from "@/components/admin/section-heading-fields";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useServerAction } from "@/hooks/use-server-action";
import type { SectionHeadingContent } from "@/types/page-sections";

export type HomePackagesEditorProps = {
  heading: SectionHeadingContent;
  packages: AdminPackageFormState[];
};

type PackageEditorState = AdminPackageFormState & {
  featuresText: string;
  excludedText: string;
};

function parseFeatures(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function toEditorState(pkg: AdminPackageFormState): PackageEditorState {
  return {
    ...pkg,
    featuresText: pkg.features.join("\n"),
    excludedText: pkg.excludedFeatures.join("\n"),
  };
}

function toSaveState(pkg: PackageEditorState): AdminPackageFormState {
  const { featuresText, excludedText, ...rest } = pkg;
  return {
    ...rest,
    features: parseFeatures(featuresText),
    excludedFeatures: parseFeatures(excludedText),
  };
}

export function HomePackagesEditor({
  heading,
  packages,
}: HomePackagesEditorProps) {
  const { run, isPending } = useServerAction();
  const [headingContent, setHeadingContent] = useState(heading);
  const [packagesContent, setPackagesContent] = useState(() =>
    packages.map(toEditorState),
  );

  const movePackage = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= packagesContent.length) return;

    setPackagesContent((current) => {
      const reordered = [...current];
      const [item] = reordered.splice(index, 1);
      reordered.splice(nextIndex, 0, item!);
      return reordered;
    });
  };

  const updatePackage = (
    index: number,
    updates: Partial<PackageEditorState>,
  ) => {
    setPackagesContent((current) =>
      current.map((pkg, i) => (i === index ? { ...pkg, ...updates } : pkg)),
    );
  };

  const setPopular = (index: number, popular: boolean) => {
    setPackagesContent((current) =>
      current.map((pkg, i) => ({
        ...pkg,
        is_popular: popular ? i === index : i === index ? false : pkg.is_popular,
      })),
    );
  };

  const handleSave = () => {
    run(
      () =>
        saveHomePackagesSection({
          heading: headingContent,
          packages: packagesContent.map(toSaveState),
        }),
      { refresh: true },
    );
  };

  return (
    <>
      <div className="space-y-4 rounded-lg border border-white/5 bg-white/[0.02] p-4">
        <div>
          <h4 className="text-sm font-medium text-white">Section heading</h4>
          <p className="mt-0.5 text-xs text-white/50">
            Eyebrow, title, and intro above the package cards
          </p>
        </div>
        <SectionHeadingFields
          content={headingContent}
          onChange={setHeadingContent}
        />
      </div>

      <div className="space-y-4 rounded-lg border border-white/5 bg-white/[0.02] p-4">
        <div>
          <h4 className="text-sm font-medium text-white">Package cards</h4>
          <p className="mt-0.5 text-xs text-white/50">
            Card order matches the homepage left-to-right layout
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {packagesContent.map((pkg, index) => (
            <AccordionItem
              key={pkg.id}
              value={pkg.id}
              className="border-white/10"
            >
              <div className="flex items-center gap-1">
                <div className="flex shrink-0 flex-col">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-white/40 hover:text-white"
                    disabled={index === 0}
                    aria-label={`Move ${pkg.name} up`}
                    onClick={() => movePackage(index, -1)}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-white/40 hover:text-white"
                    disabled={index === packagesContent.length - 1}
                    aria-label={`Move ${pkg.name} down`}
                    onClick={() => movePackage(index, 1)}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <AccordionTrigger className="flex-1 py-3 text-sm hover:no-underline">
                  <span className="flex min-w-0 items-center gap-2 pr-4 text-left">
                    <span className="truncate">{pkg.name || `Package ${index + 1}`}</span>
                    {pkg.is_popular ? (
                      <Badge className="shrink-0">Most Popular</Badge>
                    ) : null}
                    {!pkg.is_active ? (
                      <Badge variant="outline" className="shrink-0">
                        Inactive
                      </Badge>
                    ) : null}
                  </span>
                </AccordionTrigger>
              </div>
              <AccordionContent className="space-y-3 pb-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={pkg.name}
                    onChange={(e) =>
                      updatePackage(index, { name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    rows={3}
                    value={pkg.description}
                    onChange={(e) =>
                      updatePackage(index, { description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Included services</Label>
                  <Textarea
                    rows={5}
                    value={pkg.featuresText}
                    onChange={(e) =>
                      updatePackage(index, { featuresText: e.target.value })
                    }
                    placeholder={"One service per line\nPremium Interior Deep Clean\nExterior Detail"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Excluded services</Label>
                  <Textarea
                    rows={4}
                    value={pkg.excludedText}
                    onChange={(e) =>
                      updatePackage(index, { excludedText: e.target.value })
                    }
                    placeholder={"One service per line\nPaint Enhancement\nCeramic Paint Protection (1-Year & 3-Year options)"}
                  />
                  <p className="text-xs text-white/50">
                    Shown with a red cross on the homepage. Leave empty for
                    packages that include everything.
                  </p>
                </div>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={pkg.is_popular}
                      onChange={(e) => setPopular(index, e.target.checked)}
                      className="rounded border-white/20 bg-surface-base"
                    />
                    Most popular
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={pkg.is_active}
                      onChange={(e) =>
                        updatePackage(index, { is_active: e.target.checked })
                      }
                      className="rounded border-white/20 bg-surface-base"
                    />
                    Active on homepage
                  </label>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <SaveSectionButton
        label="Save packages"
        isSaving={isPending}
        onClick={handleSave}
        className="border-t border-white/10 pt-4"
      />
    </>
  );
}

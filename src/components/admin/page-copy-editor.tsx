"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  LayoutTemplate,
  Loader2,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { upsertPageSection } from "@/app/actions/admin/cms";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type HeroContent = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  mobileImage: string;
  desktopImage: string;
};

export type WhyQtmContent = {
  eyebrow: string;
  title: string;
  description: string;
  reasons: { title: string; description: string }[];
};

export type CtaBandContent = {
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

type PageCopyEditorProps = {
  hero: HeroContent;
  whyQtm: WhyQtmContent;
  ctaBand: CtaBandContent;
};

type SectionId = "hero" | "why-qtm" | "cta-band";

const SECTIONS: {
  id: SectionId;
  label: string;
  icon: typeof Sparkles;
  description: string;
}[] = [
  {
    id: "hero",
    label: "Hero",
    icon: Sparkles,
    description: "Homepage headline and intro copy",
  },
  {
    id: "why-qtm",
    label: "Why QTM",
    icon: CheckCircle2,
    description: "Value proposition and reason cards",
  },
  {
    id: "cta-band",
    label: "CTA band",
    icon: Megaphone,
    description: "Bottom call-to-action strip",
  },
];

function FieldGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-lg border border-white/5 bg-white/[0.02] p-4">
      <div>
        <h4 className="text-sm font-medium text-white">{title}</h4>
        {description ? (
          <p className="mt-0.5 text-xs text-white/50">{description}</p>
        ) : null}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function CtaFields({
  primary,
  secondary,
  onPrimaryChange,
  onSecondaryChange,
}: {
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  onPrimaryChange: (field: "label" | "href", value: string) => void;
  onSecondaryChange: (field: "label" | "href", value: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-3 rounded-md border border-white/5 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-cyan-400">
          Primary button
        </p>
        <div className="space-y-2">
          <Label>Label</Label>
          <Input
            value={primary.label}
            onChange={(e) => onPrimaryChange("label", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Link</Label>
          <Input
            value={primary.href}
            onChange={(e) => onPrimaryChange("href", e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-3 rounded-md border border-white/5 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-white/50">
          Secondary button
        </p>
        <div className="space-y-2">
          <Label>Label</Label>
          <Input
            value={secondary.label}
            onChange={(e) => onSecondaryChange("label", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Link</Label>
          <Input
            value={secondary.href}
            onChange={(e) => onSecondaryChange("href", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function HeroPreview({ content }: { content: HeroContent }) {
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-surface-base p-6">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-brand-cyan-400">
        {content.eyebrow || "Eyebrow"}
      </p>
      <div>
        <p className="text-2xl font-bold leading-tight">
          <span className="gradient-text">
            {content.titleLine1 || "Title line 1"}
          </span>
          <br />
          <span className="text-white">
            {content.titleLine2 || "Title line 2"}
          </span>
        </p>
        <p className="mt-3 text-sm text-white/60">
          {content.description || "Description preview…"}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-brand-purple-600 px-3 py-1 text-xs font-medium">
          {content.primaryCta.label || "Primary CTA"}
        </span>
        <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium">
          {content.secondaryCta.label || "Secondary CTA"}
        </span>
      </div>
    </div>
  );
}

function WhyQtmPreview({ content }: { content: WhyQtmContent }) {
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-surface-raised/30 p-6">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-brand-cyan-400">
          {content.eyebrow || "Eyebrow"}
        </p>
        <p className="mt-2 text-xl font-bold">
          {content.title || "Section title"}
        </p>
        <p className="mt-2 text-sm text-white/60">
          {content.description || "Section description…"}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {content.reasons.map((reason, index) => (
          <div
            key={index}
            className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
          >
            <CheckCircle2 className="mb-2 h-4 w-4 text-brand-cyan-400" />
            <p className="text-sm font-medium">
              {reason.title || `Reason ${index + 1}`}
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-white/50">
              {reason.description || "Description…"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CtaBandPreview({ content }: { content: CtaBandContent }) {
  return (
    <div className="overflow-hidden rounded-xl bg-gradient-to-br from-brand-purple-900 via-brand-purple-950 to-surface-base p-6 text-center">
      <p className="text-lg font-bold">{content.title || "CTA title"}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-white/60">
        {content.description || "CTA description…"}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <span className="rounded-full bg-brand-purple-600 px-3 py-1 text-xs font-medium">
          {content.primaryCta.label || "Primary CTA"}
        </span>
        <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium">
          {content.secondaryCta.label || "Secondary CTA"}
        </span>
      </div>
    </div>
  );
}

export function PageCopyEditor({ hero, whyQtm, ctaBand }: PageCopyEditorProps) {
  const [activeSection, setActiveSection] = useState<SectionId>("hero");
  const [heroContent, setHeroContent] = useState(hero);
  const [whyContent, setWhyContent] = useState(whyQtm);
  const [ctaContent, setCtaContent] = useState(ctaBand);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeMeta = SECTIONS.find((section) => section.id === activeSection)!;

  const saveSection = (
    sectionKey: string,
    content: HeroContent | WhyQtmContent | CtaBandContent,
  ) => {
    setSavingSection(sectionKey);
    startTransition(async () => {
      const result = await upsertPageSection({
        page_key: "home",
        section_key: sectionKey,
        content,
      });
      setSavingSection(null);
      if (result.success) toast.success("Changes saved.");
      else toast.error(result.message);
    });
  };

  const isSaving = (sectionKey: string) =>
    isPending && savingSection === sectionKey;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-brand-purple-500/50 bg-brand-purple-500/15 text-white"
                  : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {section.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>{activeMeta.label}</CardTitle>
            <CardDescription>{activeMeta.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {activeSection === "hero" ? (
              <>
                <FieldGroup
                  title="Headline"
                  description="The main title visitors see first"
                >
                  <div className="space-y-2">
                    <Label>Eyebrow</Label>
                    <Input
                      value={heroContent.eyebrow}
                      onChange={(e) =>
                        setHeroContent((p) => ({
                          ...p,
                          eyebrow: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Title line 1 (gradient)</Label>
                      <Input
                        value={heroContent.titleLine1}
                        onChange={(e) =>
                          setHeroContent((p) => ({
                            ...p,
                            titleLine1: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Title line 2</Label>
                      <Input
                        value={heroContent.titleLine2}
                        onChange={(e) =>
                          setHeroContent((p) => ({
                            ...p,
                            titleLine2: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </FieldGroup>

                <FieldGroup title="Description">
                  <Textarea
                    rows={4}
                    value={heroContent.description}
                    onChange={(e) =>
                      setHeroContent((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                  />
                </FieldGroup>

                <FieldGroup
                  title="Buttons"
                  description="Primary and secondary actions below the hero"
                >
                  <CtaFields
                    primary={heroContent.primaryCta}
                    secondary={heroContent.secondaryCta}
                    onPrimaryChange={(field, value) =>
                      setHeroContent((p) => ({
                        ...p,
                        primaryCta: { ...p.primaryCta, [field]: value },
                      }))
                    }
                    onSecondaryChange={(field, value) =>
                      setHeroContent((p) => ({
                        ...p,
                        secondaryCta: { ...p.secondaryCta, [field]: value },
                      }))
                    }
                  />
                </FieldGroup>

                <div className="flex justify-end border-t border-white/10 pt-4">
                  <Button
                    onClick={() => saveSection("hero", heroContent)}
                    disabled={isSaving("hero")}
                  >
                    {isSaving("hero") ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save hero"
                    )}
                  </Button>
                </div>
              </>
            ) : null}

            {activeSection === "why-qtm" ? (
              <>
                <FieldGroup
                  title="Section intro"
                  description="Heading and intro text above the reason cards"
                >
                  <div className="space-y-2">
                    <Label>Eyebrow</Label>
                    <Input
                      value={whyContent.eyebrow}
                      onChange={(e) =>
                        setWhyContent((p) => ({
                          ...p,
                          eyebrow: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={whyContent.title}
                      onChange={(e) =>
                        setWhyContent((p) => ({
                          ...p,
                          title: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      rows={3}
                      value={whyContent.description}
                      onChange={(e) =>
                        setWhyContent((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                </FieldGroup>

                <FieldGroup
                  title="Reason cards"
                  description="Expand each card to edit its copy"
                >
                  <Accordion type="single" collapsible className="w-full">
                    {whyContent.reasons.map((reason, index) => (
                      <AccordionItem
                        key={index}
                        value={`reason-${index}`}
                        className="border-white/10"
                      >
                        <AccordionTrigger className="py-3 text-sm hover:no-underline">
                          <span className="truncate pr-4 text-left">
                            {reason.title || `Reason ${index + 1}`}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3 pb-2">
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                              value={reason.title}
                              onChange={(e) =>
                                setWhyContent((p) => ({
                                  ...p,
                                  reasons: p.reasons.map((r, i) =>
                                    i === index
                                      ? { ...r, title: e.target.value }
                                      : r,
                                  ),
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              rows={3}
                              value={reason.description}
                              onChange={(e) =>
                                setWhyContent((p) => ({
                                  ...p,
                                  reasons: p.reasons.map((r, i) =>
                                    i === index
                                      ? { ...r, description: e.target.value }
                                      : r,
                                  ),
                                }))
                              }
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </FieldGroup>

                <div className="flex justify-end border-t border-white/10 pt-4">
                  <Button
                    onClick={() => saveSection("why-qtm", whyContent)}
                    disabled={isSaving("why-qtm")}
                  >
                    {isSaving("why-qtm") ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save why QTM"
                    )}
                  </Button>
                </div>
              </>
            ) : null}

            {activeSection === "cta-band" ? (
              <>
                <FieldGroup title="Content">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={ctaContent.title}
                      onChange={(e) =>
                        setCtaContent((p) => ({
                          ...p,
                          title: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      rows={3}
                      value={ctaContent.description}
                      onChange={(e) =>
                        setCtaContent((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                </FieldGroup>

                <FieldGroup title="Buttons">
                  <CtaFields
                    primary={ctaContent.primaryCta}
                    secondary={ctaContent.secondaryCta}
                    onPrimaryChange={(field, value) =>
                      setCtaContent((p) => ({
                        ...p,
                        primaryCta: { ...p.primaryCta, [field]: value },
                      }))
                    }
                    onSecondaryChange={(field, value) =>
                      setCtaContent((p) => ({
                        ...p,
                        secondaryCta: { ...p.secondaryCta, [field]: value },
                      }))
                    }
                  />
                </FieldGroup>

                <div className="flex justify-end border-t border-white/10 pt-4">
                  <Button
                    onClick={() => saveSection("cta-band", ctaContent)}
                    disabled={isSaving("cta-band")}
                  >
                    {isSaving("cta-band") ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save CTA band"
                    )}
                  </Button>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <aside className="space-y-3 xl:sticky xl:top-8 xl:self-start">
          <div className="flex items-center gap-2 text-sm font-medium text-white/70">
            <LayoutTemplate className="h-4 w-4" />
            Live preview
          </div>
          {activeSection === "hero" ? (
            <HeroPreview content={heroContent} />
          ) : null}
          {activeSection === "why-qtm" ? (
            <WhyQtmPreview content={whyContent} />
          ) : null}
          {activeSection === "cta-band" ? (
            <CtaBandPreview content={ctaContent} />
          ) : null}
        </aside>
      </div>
    </div>
  );
}

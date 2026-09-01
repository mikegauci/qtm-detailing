"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { upsertPageSection } from "@/app/actions/admin/cms";
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
import type {
  AboutIntroContent,
  EquipmentContent,
  PaintProtectionIntroContent,
  PricingInfoContent,
  ProcessStepsContent,
  SectionHeadingContent,
} from "@/types/page-sections";

type SitePageCopyEditorProps = {
  featuredServices: SectionHeadingContent;
  servicesHero: SectionHeadingContent;
  packagesHeading: SectionHeadingContent;
  faqHeading: SectionHeadingContent;
  pricingInfo: PricingInfoContent;
  paintProtectionIntro: PaintProtectionIntroContent;
  aboutIntro: AboutIntroContent;
  processSteps: ProcessStepsContent;
  equipment: EquipmentContent;
  contactHero: SectionHeadingContent;
  galleryHero: SectionHeadingContent;
};

type PageTab = "services" | "about" | "contact" | "gallery" | "home-extra";

function SectionHeadingFields({
  content,
  onChange,
}: {
  content: SectionHeadingContent;
  onChange: (content: SectionHeadingContent) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Eyebrow</Label>
        <Input
          value={content.eyebrow}
          onChange={(e) => onChange({ ...content, eyebrow: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={content.title}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          rows={3}
          value={content.description}
          onChange={(e) => onChange({ ...content, description: e.target.value })}
        />
      </div>
    </div>
  );
}

export function SitePageCopyEditor({
  featuredServices,
  servicesHero,
  packagesHeading,
  faqHeading,
  pricingInfo,
  paintProtectionIntro,
  aboutIntro,
  processSteps,
  equipment,
  contactHero,
  galleryHero,
}: SitePageCopyEditorProps) {
  const [activeTab, setActiveTab] = useState<PageTab>("home-extra");
  const [featuredServicesContent, setFeaturedServicesContent] =
    useState(featuredServices);
  const [servicesHeroContent, setServicesHeroContent] = useState(servicesHero);
  const [packagesHeadingContent, setPackagesHeadingContent] =
    useState(packagesHeading);
  const [faqHeadingContent, setFaqHeadingContent] = useState(faqHeading);
  const [pricingInfoContent, setPricingInfoContent] = useState(pricingInfo);
  const [paintProtectionContent, setPaintProtectionContent] = useState(
    paintProtectionIntro,
  );
  const [aboutIntroContent, setAboutIntroContent] = useState(aboutIntro);
  const [processStepsContent, setProcessStepsContent] = useState(processSteps);
  const [equipmentContent, setEquipmentContent] = useState(equipment);
  const [contactHeroContent, setContactHeroContent] = useState(contactHero);
  const [galleryHeroContent, setGalleryHeroContent] = useState(galleryHero);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const save = (pageKey: string, sectionKey: string, content: unknown) => {
    const key = `${pageKey}:${sectionKey}`;
    setSavingKey(key);
    startTransition(async () => {
      const result = await upsertPageSection({
        page_key: pageKey,
        section_key: sectionKey,
        content: content as import("@/lib/supabase/types").Json,
      });
      setSavingKey(null);
      if (result.success) toast.success("Changes saved.");
      else toast.error(result.message);
    });
  };

  const tabs: { id: PageTab; label: string }[] = [
    { id: "home-extra", label: "Home" },
    { id: "services", label: "Services" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
    { id: "gallery", label: "Gallery" },
  ];

  const isSaving = (pageKey: string, sectionKey: string) =>
    isPending && savingKey === `${pageKey}:${sectionKey}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-brand-purple-500/50 bg-brand-purple-500/15 text-white"
                : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:text-white",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "home-extra" ? (
        <Card>
          <CardHeader>
            <CardTitle>Featured services heading</CardTitle>
            <CardDescription>Section above the homepage carousel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionHeadingFields
              content={featuredServicesContent}
              onChange={setFeaturedServicesContent}
            />
            <div className="flex justify-end">
              <Button
                onClick={() =>
                  save("home", "featured-services", featuredServicesContent)
                }
                disabled={isSaving("home", "featured-services")}
              >
                {isSaving("home", "featured-services") ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "services" ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page hero</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SectionHeadingFields
                content={servicesHeroContent}
                onChange={setServicesHeroContent}
              />
              <div className="flex justify-end">
                <Button
                  onClick={() => save("services", "hero", servicesHeroContent)}
                  disabled={isSaving("services", "hero")}
                >
                  {isSaving("services", "hero") ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save hero"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Paint protection intro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Heading</Label>
                <Input
                  value={paintProtectionContent.heading}
                  onChange={(e) =>
                    setPaintProtectionContent((p) => ({
                      ...p,
                      heading: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Intro</Label>
                <Textarea
                  rows={3}
                  value={paintProtectionContent.intro}
                  onChange={(e) =>
                    setPaintProtectionContent((p) => ({
                      ...p,
                      intro: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() =>
                    save(
                      "services",
                      "paint-protection-intro",
                      paintProtectionContent,
                    )
                  }
                  disabled={isSaving("services", "paint-protection-intro")}
                >
                  {isSaving("services", "paint-protection-intro") ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save intro"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Packages section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SectionHeadingFields
                content={packagesHeadingContent}
                onChange={setPackagesHeadingContent}
              />
              <div className="flex justify-end">
                <Button
                  onClick={() =>
                    save("services", "packages-heading", packagesHeadingContent)
                  }
                  disabled={isSaving("services", "packages-heading")}
                >
                  {isSaving("services", "packages-heading") ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save packages heading"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={pricingInfoContent.title}
                  onChange={(e) =>
                    setPricingInfoContent((p) => ({
                      ...p,
                      title: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Paragraphs (one per line)</Label>
                <Textarea
                  rows={8}
                  value={pricingInfoContent.paragraphs.join("\n")}
                  onChange={(e) =>
                    setPricingInfoContent((p) => ({
                      ...p,
                      paragraphs: e.target.value
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean),
                    }))
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() =>
                    save("services", "pricing-info", pricingInfoContent)
                  }
                  disabled={isSaving("services", "pricing-info")}
                >
                  {isSaving("services", "pricing-info") ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save pricing info"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FAQ section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SectionHeadingFields
                content={faqHeadingContent}
                onChange={setFaqHeadingContent}
              />
              <div className="flex justify-end">
                <Button
                  onClick={() => save("services", "faq-heading", faqHeadingContent)}
                  disabled={isSaving("services", "faq-heading")}
                >
                  {isSaving("services", "faq-heading") ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save FAQ heading"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {activeTab === "about" ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Intro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SectionHeadingFields
                content={aboutIntroContent}
                onChange={(content) =>
                  setAboutIntroContent({ ...aboutIntroContent, ...content })
                }
              />
              <div className="space-y-2">
                <Label>Mission paragraph</Label>
                <Textarea
                  rows={4}
                  value={aboutIntroContent.mission}
                  onChange={(e) =>
                    setAboutIntroContent((p) => ({
                      ...p,
                      mission: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Mobile image</Label>
                  <Input
                    value={aboutIntroContent.mobileImage}
                    onChange={(e) =>
                      setAboutIntroContent((p) => ({
                        ...p,
                        mobileImage: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Desktop image</Label>
                  <Input
                    value={aboutIntroContent.desktopImage}
                    onChange={(e) =>
                      setAboutIntroContent((p) => ({
                        ...p,
                        desktopImage: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => save("about", "intro", aboutIntroContent)}
                  disabled={isSaving("about", "intro")}
                >
                  {isSaving("about", "intro") ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save intro"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Process steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SectionHeadingFields
                content={processStepsContent}
                onChange={(content) =>
                  setProcessStepsContent({ ...processStepsContent, ...content })
                }
              />
              {processStepsContent.steps.map((step, index) => (
                <div
                  key={step.step}
                  className="space-y-3 rounded-lg border border-white/10 p-4"
                >
                  <p className="text-sm font-medium">Step {step.step}</p>
                  <Input
                    value={step.title}
                    onChange={(e) =>
                      setProcessStepsContent((p) => ({
                        ...p,
                        steps: p.steps.map((s, i) =>
                          i === index ? { ...s, title: e.target.value } : s,
                        ),
                      }))
                    }
                  />
                  <Textarea
                    rows={2}
                    value={step.description}
                    onChange={(e) =>
                      setProcessStepsContent((p) => ({
                        ...p,
                        steps: p.steps.map((s, i) =>
                          i === index
                            ? { ...s, description: e.target.value }
                            : s,
                        ),
                      }))
                    }
                  />
                </div>
              ))}
              <div className="flex justify-end">
                <Button
                  onClick={() =>
                    save("about", "process-steps", processStepsContent)
                  }
                  disabled={isSaving("about", "process-steps")}
                >
                  {isSaving("about", "process-steps") ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save process"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Equipment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SectionHeadingFields
                content={equipmentContent}
                onChange={(content) =>
                  setEquipmentContent({ ...equipmentContent, ...content })
                }
              />
              <div className="space-y-2">
                <Label>Items (one per line)</Label>
                <Textarea
                  rows={4}
                  value={equipmentContent.items.join("\n")}
                  onChange={(e) =>
                    setEquipmentContent((p) => ({
                      ...p,
                      items: e.target.value
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean),
                    }))
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => save("about", "equipment", equipmentContent)}
                  disabled={isSaving("about", "equipment")}
                >
                  {isSaving("about", "equipment") ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save equipment"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {activeTab === "contact" ? (
        <Card>
          <CardHeader>
            <CardTitle>Page hero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionHeadingFields
              content={contactHeroContent}
              onChange={setContactHeroContent}
            />
            <div className="flex justify-end">
              <Button
                onClick={() => save("contact", "hero", contactHeroContent)}
                disabled={isSaving("contact", "hero")}
              >
                {isSaving("contact", "hero") ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save hero"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "gallery" ? (
        <Card>
          <CardHeader>
            <CardTitle>Page hero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionHeadingFields
              content={galleryHeroContent}
              onChange={setGalleryHeroContent}
            />
            <div className="flex justify-end">
              <Button
                onClick={() => save("gallery", "hero", galleryHeroContent)}
                disabled={isSaving("gallery", "hero")}
              >
                {isSaving("gallery", "hero") ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save hero"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

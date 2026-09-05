"use client";

import { useState } from "react";
import { CheckCircle2, LayoutTemplate } from "lucide-react";
import { CmsImageField } from "@/components/admin/cms-image-field";
import { EditorTabBar } from "@/components/admin/editor-tab-bar";
import {
  getFirstSectionId,
  getSectionConfig,
  hasPreview,
  PAGE_COPY_NAV,
  PAGE_KEYS,
  type PageKey,
} from "@/components/admin/page-copy-config";
import { SaveSectionButton } from "@/components/admin/save-section-button";
import { SectionHeadingFields } from "@/components/admin/section-heading-fields";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { usePageSectionSave } from "@/hooks/use-page-section-save";
import type {
  AboutIntroContent,
  CtaBandContent,
  HeroContent,
  PricingInfoContent,
  ProcessStepsContent,
  SectionHeadingContent,
  WhyQtmContent,
} from "@/types/page-sections";

export type PageCopyEditorProps = {
  hero: HeroContent;
  whyQtm: WhyQtmContent;
  ctaBand: CtaBandContent;
  featuredServices: SectionHeadingContent;
  servicesHero: SectionHeadingContent;
  faqHeading: SectionHeadingContent;
  pricingInfo: PricingInfoContent;
  aboutIntro: AboutIntroContent;
  processSteps: ProcessStepsContent;
  contactHero: SectionHeadingContent;
  galleryHero: SectionHeadingContent;
};

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

export function PageCopyEditor({
  hero,
  whyQtm,
  ctaBand,
  featuredServices,
  servicesHero,
  faqHeading,
  pricingInfo,
  aboutIntro,
  processSteps,
  contactHero,
  galleryHero,
}: PageCopyEditorProps) {
  const [activePage, setActivePage] = useState<PageKey>("home");
  const [activeSection, setActiveSection] = useState(() =>
    getFirstSectionId("home"),
  );

  const [heroContent, setHeroContent] = useState(hero);
  const [whyContent, setWhyContent] = useState(whyQtm);
  const [ctaContent, setCtaContent] = useState(ctaBand);
  const [featuredServicesContent, setFeaturedServicesContent] =
    useState(featuredServices);
  const [servicesHeroContent, setServicesHeroContent] = useState(servicesHero);
  const [faqHeadingContent, setFaqHeadingContent] = useState(faqHeading);
  const [pricingInfoContent, setPricingInfoContent] = useState(pricingInfo);
  const [aboutIntroContent, setAboutIntroContent] = useState(aboutIntro);
  const [processStepsContent, setProcessStepsContent] = useState(processSteps);
  const [contactHeroContent, setContactHeroContent] = useState(contactHero);
  const [galleryHeroContent, setGalleryHeroContent] = useState(galleryHero);

  const { save, isSaving } = usePageSectionSave();

  const pageConfig = PAGE_COPY_NAV[activePage];
  const sectionConfig = getSectionConfig(activePage, activeSection);
  const showPreview = hasPreview(activePage, activeSection);
  const showSectionTabs = pageConfig.sections.length > 1;

  const pageTabs = PAGE_KEYS.map((page) => {
    const config = PAGE_COPY_NAV[page];
    const Icon = config.icon;
    return {
      id: page,
      label: config.label,
      icon: <Icon className="h-4 w-4 shrink-0" />,
    };
  });

  const sectionTabs = pageConfig.sections.map((section) => {
    const Icon = section.icon;
    return {
      id: section.id,
      label: section.label,
      icon: Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : undefined,
    };
  });

  function handlePageChange(page: PageKey) {
    setActivePage(page);
    setActiveSection(getFirstSectionId(page));
  }

  function renderSectionEditor() {
    if (activePage === "home" && activeSection === "hero") {
      return (
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
                  setHeroContent((p) => ({ ...p, eyebrow: e.target.value }))
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
                setHeroContent((p) => ({ ...p, description: e.target.value }))
              }
            />
          </FieldGroup>

          <FieldGroup
            title="Hero images"
            description="Background images shown on the homepage hero"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <CmsImageField
                label="Mobile image"
                value={heroContent.mobileImage}
                onChange={(url) =>
                  setHeroContent((p) => ({ ...p, mobileImage: url }))
                }
                folder="hero"
                filename="hero-mobile"
              />
              <CmsImageField
                label="Desktop image"
                value={heroContent.desktopImage}
                onChange={(url) =>
                  setHeroContent((p) => ({ ...p, desktopImage: url }))
                }
                folder="hero"
                filename="hero-desktop"
              />
            </div>
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

          <SaveSectionButton
            label="Save hero"
            isSaving={isSaving("home", "hero")}
            onClick={() => save("home", "hero", heroContent)}
            className="border-t border-white/10 pt-4"
          />
        </>
      );
    }

    if (activePage === "home" && activeSection === "why-qtm") {
      return (
        <>
          <FieldGroup
            title="Section intro"
            description="Heading and intro text above the reason cards"
          >
            <SectionHeadingFields
              content={whyContent}
              onChange={(content) =>
                setWhyContent({ ...whyContent, ...content })
              }
            />
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

          <SaveSectionButton
            label="Save why QTM"
            isSaving={isSaving("home", "why-qtm")}
            onClick={() => save("home", "why-qtm", whyContent)}
            className="border-t border-white/10 pt-4"
          />
        </>
      );
    }

    if (activePage === "home" && activeSection === "featured-services") {
      return (
        <>
          <SectionHeadingFields
            content={featuredServicesContent}
            onChange={setFeaturedServicesContent}
          />
          <SaveSectionButton
            label="Save featured services"
            isSaving={isSaving("home", "featured-services")}
            onClick={() =>
              save("home", "featured-services", featuredServicesContent)
            }
            className="border-t border-white/10 pt-4"
          />
        </>
      );
    }

    if (activePage === "home" && activeSection === "cta-band") {
      return (
        <>
          {sectionConfig?.note ? (
            <p className="rounded-lg border border-brand-purple-500/20 bg-brand-purple-500/10 px-3 py-2 text-xs text-white/70">
              {sectionConfig.note}
            </p>
          ) : null}

          <FieldGroup title="Content">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={ctaContent.title}
                onChange={(e) =>
                  setCtaContent((p) => ({ ...p, title: e.target.value }))
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

          <SaveSectionButton
            label="Save CTA band"
            isSaving={isSaving("home", "cta-band")}
            onClick={() => save("home", "cta-band", ctaContent)}
            className="border-t border-white/10 pt-4"
          />
        </>
      );
    }

    if (activePage === "services" && activeSection === "hero") {
      return (
        <>
          <SectionHeadingFields
            content={servicesHeroContent}
            onChange={setServicesHeroContent}
          />
          <SaveSectionButton
            label="Save hero"
            isSaving={isSaving("services", "hero")}
            onClick={() => save("services", "hero", servicesHeroContent)}
            className="border-t border-white/10 pt-4"
          />
        </>
      );
    }

    if (activePage === "services" && activeSection === "pricing-info") {
      return (
        <>
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
          <SaveSectionButton
            label="Save pricing info"
            isSaving={isSaving("services", "pricing-info")}
            onClick={() =>
              save("services", "pricing-info", pricingInfoContent)
            }
            className="border-t border-white/10 pt-4"
          />
        </>
      );
    }

    if (activePage === "services" && activeSection === "faq-heading") {
      return (
        <>
          <SectionHeadingFields
            content={faqHeadingContent}
            onChange={setFaqHeadingContent}
          />
          <SaveSectionButton
            label="Save FAQ heading"
            isSaving={isSaving("services", "faq-heading")}
            onClick={() => save("services", "faq-heading", faqHeadingContent)}
            className="border-t border-white/10 pt-4"
          />
        </>
      );
    }

    if (activePage === "about" && activeSection === "intro") {
      return (
        <>
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
            <CmsImageField
              label="Mobile image"
              value={aboutIntroContent.mobileImage}
              onChange={(url) =>
                setAboutIntroContent((p) => ({ ...p, mobileImage: url }))
              }
              folder="about"
              filename="about-page-mobile"
            />
            <CmsImageField
              label="Desktop image"
              value={aboutIntroContent.desktopImage}
              onChange={(url) =>
                setAboutIntroContent((p) => ({ ...p, desktopImage: url }))
              }
              folder="about"
              filename="about-page"
            />
          </div>
          <SaveSectionButton
            label="Save intro"
            isSaving={isSaving("about", "intro")}
            onClick={() => save("about", "intro", aboutIntroContent)}
            className="border-t border-white/10 pt-4"
          />
        </>
      );
    }

    if (activePage === "about" && activeSection === "process-steps") {
      return (
        <>
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
          <SaveSectionButton
            label="Save process"
            isSaving={isSaving("about", "process-steps")}
            onClick={() => save("about", "process-steps", processStepsContent)}
            className="border-t border-white/10 pt-4"
          />
        </>
      );
    }

    if (activePage === "contact" && activeSection === "hero") {
      return (
        <>
          <SectionHeadingFields
            content={contactHeroContent}
            onChange={setContactHeroContent}
          />
          <SaveSectionButton
            label="Save hero"
            isSaving={isSaving("contact", "hero")}
            onClick={() => save("contact", "hero", contactHeroContent)}
            className="border-t border-white/10 pt-4"
          />
        </>
      );
    }

    if (activePage === "gallery" && activeSection === "hero") {
      return (
        <>
          <SectionHeadingFields
            content={galleryHeroContent}
            onChange={setGalleryHeroContent}
          />
          <SaveSectionButton
            label="Save hero"
            isSaving={isSaving("gallery", "hero")}
            onClick={() => save("gallery", "hero", galleryHeroContent)}
            className="border-t border-white/10 pt-4"
          />
        </>
      );
    }

    return null;
  }

  function renderPreview() {
    if (activePage === "home" && activeSection === "hero") {
      return <HeroPreview content={heroContent} />;
    }
    if (activePage === "home" && activeSection === "why-qtm") {
      return <WhyQtmPreview content={whyContent} />;
    }
    if (activePage === "home" && activeSection === "cta-band") {
      return <CtaBandPreview content={ctaContent} />;
    }
    return null;
  }

  return (
    <div className="space-y-5">
      <EditorTabBar
        variant="page"
        value={activePage}
        tabs={pageTabs}
        onChange={handlePageChange}
      />

      {showSectionTabs ? (
        <EditorTabBar
          variant="section"
          value={activeSection}
          tabs={sectionTabs}
          onChange={setActiveSection}
        />
      ) : null}

      <div
        className={
          showPreview
            ? "grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
            : "grid gap-6"
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>{sectionConfig?.label ?? "Section"}</CardTitle>
            {sectionConfig?.description ? (
              <CardDescription>{sectionConfig.description}</CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-5">{renderSectionEditor()}</CardContent>
        </Card>

        {showPreview ? (
          <aside className="space-y-3 xl:sticky xl:top-8 xl:self-start">
            <div className="flex items-center gap-2 text-sm font-medium text-white/70">
              <LayoutTemplate className="h-4 w-4" />
              Live preview
            </div>
            {renderPreview()}
          </aside>
        ) : null}
      </div>
    </div>
  );
}

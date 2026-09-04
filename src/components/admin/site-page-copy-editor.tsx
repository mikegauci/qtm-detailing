"use client";

import { useState } from "react";
import { CmsImageField } from "@/components/admin/cms-image-field";
import { EditorTabBar } from "@/components/admin/editor-tab-bar";
import { SaveSectionButton } from "@/components/admin/save-section-button";
import { SectionHeadingFields } from "@/components/admin/section-heading-fields";
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
  PricingInfoContent,
  ProcessStepsContent,
  SectionHeadingContent,
} from "@/types/page-sections";

type SitePageCopyEditorProps = {
  featuredServices: SectionHeadingContent;
  servicesHero: SectionHeadingContent;
  faqHeading: SectionHeadingContent;
  pricingInfo: PricingInfoContent;
  aboutIntro: AboutIntroContent;
  processSteps: ProcessStepsContent;
  contactHero: SectionHeadingContent;
  galleryHero: SectionHeadingContent;
};

type PageTab = "services" | "about" | "contact" | "gallery" | "home-extra";

export function SitePageCopyEditor({
  featuredServices,
  servicesHero,
  faqHeading,
  pricingInfo,
  aboutIntro,
  processSteps,
  contactHero,
  galleryHero,
}: SitePageCopyEditorProps) {
  const [activeTab, setActiveTab] = useState<PageTab>("home-extra");
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

  const tabs: { id: PageTab; label: string }[] = [
    { id: "home-extra", label: "Home" },
    { id: "services", label: "Services" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
    { id: "gallery", label: "Gallery" },
  ];

  return (
    <div className="space-y-6">
      <EditorTabBar value={activeTab} tabs={tabs} onChange={setActiveTab} />

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
            <SaveSectionButton
              label="Save"
              isSaving={isSaving("home", "featured-services")}
              onClick={() =>
                save("home", "featured-services", featuredServicesContent)
              }
            />
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
              <SaveSectionButton
                label="Save hero"
                isSaving={isSaving("services", "hero")}
                onClick={() => save("services", "hero", servicesHeroContent)}
              />
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
              <SaveSectionButton
                label="Save pricing info"
                isSaving={isSaving("services", "pricing-info")}
                onClick={() =>
                  save("services", "pricing-info", pricingInfoContent)
                }
              />
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
              <SaveSectionButton
                label="Save FAQ heading"
                isSaving={isSaving("services", "faq-heading")}
                onClick={() => save("services", "faq-heading", faqHeadingContent)}
              />
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
                <CmsImageField
                  label="Mobile image"
                  value={aboutIntroContent.mobileImage}
                  onChange={(url) =>
                    setAboutIntroContent((p) => ({
                      ...p,
                      mobileImage: url,
                    }))
                  }
                  folder="about"
                  filename="about-page-mobile"
                />
                <CmsImageField
                  label="Desktop image"
                  value={aboutIntroContent.desktopImage}
                  onChange={(url) =>
                    setAboutIntroContent((p) => ({
                      ...p,
                      desktopImage: url,
                    }))
                  }
                  folder="about"
                  filename="about-page"
                />
              </div>
              <SaveSectionButton
                label="Save intro"
                isSaving={isSaving("about", "intro")}
                onClick={() => save("about", "intro", aboutIntroContent)}
              />
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
              <SaveSectionButton
                label="Save process"
                isSaving={isSaving("about", "process-steps")}
                onClick={() =>
                  save("about", "process-steps", processStepsContent)
                }
              />
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
            <SaveSectionButton
              label="Save hero"
              isSaving={isSaving("contact", "hero")}
              onClick={() => save("contact", "hero", contactHeroContent)}
            />
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
            <SaveSectionButton
              label="Save hero"
              isSaving={isSaving("gallery", "hero")}
              onClick={() => save("gallery", "hero", galleryHeroContent)}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

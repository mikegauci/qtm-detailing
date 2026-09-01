"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { upsertPageSection } from "@/app/actions/admin/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

export function PageCopyEditor({ hero, whyQtm, ctaBand }: PageCopyEditorProps) {
  const [heroContent, setHeroContent] = useState(hero);
  const [whyContent, setWhyContent] = useState(whyQtm);
  const [ctaContent, setCtaContent] = useState(ctaBand);
  const [isPending, startTransition] = useTransition();

  const saveSection = (
    sectionKey: string,
    content: HeroContent | WhyQtmContent | CtaBandContent,
  ) => {
    startTransition(async () => {
      const result = await upsertPageSection({
        page_key: "home",
        section_key: sectionKey,
        content,
      });
      if (result.success) toast.success(`${sectionKey} saved.`);
      else toast.error(result.message);
    });
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-xl border border-white/10 p-5">
        <h2 className="text-lg font-semibold">Hero section</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Eyebrow</Label>
            <Input
              value={heroContent.eyebrow}
              onChange={(e) =>
                setHeroContent((p) => ({ ...p, eyebrow: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Title line 1 (gradient)</Label>
            <Input
              value={heroContent.titleLine1}
              onChange={(e) =>
                setHeroContent((p) => ({ ...p, titleLine1: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Title line 2</Label>
            <Input
              value={heroContent.titleLine2}
              onChange={(e) =>
                setHeroContent((p) => ({ ...p, titleLine2: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={heroContent.description}
            onChange={(e) =>
              setHeroContent((p) => ({ ...p, description: e.target.value }))
            }
          />
        </div>
        <Button
          onClick={() => saveSection("hero", heroContent)}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save hero"}
        </Button>
      </section>

      <section className="space-y-4 rounded-xl border border-white/10 p-5">
        <h2 className="text-lg font-semibold">Why QTM section</h2>
        <div className="space-y-2">
          <Label>Eyebrow</Label>
          <Input
            value={whyContent.eyebrow}
            onChange={(e) =>
              setWhyContent((p) => ({ ...p, eyebrow: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={whyContent.title}
            onChange={(e) =>
              setWhyContent((p) => ({ ...p, title: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={whyContent.description}
            onChange={(e) =>
              setWhyContent((p) => ({ ...p, description: e.target.value }))
            }
          />
        </div>
        {whyContent.reasons.map((reason, index) => (
          <div key={index} className="rounded-lg border border-white/10 p-3">
            <div className="space-y-2">
              <Label>Reason {index + 1} title</Label>
              <Input
                value={reason.title}
                onChange={(e) =>
                  setWhyContent((p) => ({
                    ...p,
                    reasons: p.reasons.map((r, i) =>
                      i === index ? { ...r, title: e.target.value } : r,
                    ),
                  }))
                }
              />
            </div>
            <div className="mt-2 space-y-2">
              <Label>Description</Label>
              <Textarea
                value={reason.description}
                onChange={(e) =>
                  setWhyContent((p) => ({
                    ...p,
                    reasons: p.reasons.map((r, i) =>
                      i === index ? { ...r, description: e.target.value } : r,
                    ),
                  }))
                }
              />
            </div>
          </div>
        ))}
        <Button
          onClick={() => saveSection("why-qtm", whyContent)}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save why QTM"}
        </Button>
      </section>

      <section className="space-y-4 rounded-xl border border-white/10 p-5">
        <h2 className="text-lg font-semibold">CTA band</h2>
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
            value={ctaContent.description}
            onChange={(e) =>
              setCtaContent((p) => ({ ...p, description: e.target.value }))
            }
          />
        </div>
        <Button
          onClick={() => saveSection("cta-band", ctaContent)}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save CTA band"}
        </Button>
      </section>
    </div>
  );
}

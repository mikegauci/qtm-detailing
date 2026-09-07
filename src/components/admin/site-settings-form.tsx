"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { upsertSiteSettings } from "@/app/actions/admin/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { normalizeSiteUrl, validateProductionSiteUrl } from "@/lib/seo/site-url";
import type { SiteConfig } from "@/types/content";

type SiteSettingsFormProps = {
  initialSettings: SiteConfig;
};

export function SiteSettingsForm({ initialSettings }: SiteSettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isPending, startTransition] = useTransition();

  const updateField = (path: string, value: string) => {
    setSettings((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let current: Record<string, unknown> = next as unknown as Record<
        string,
        unknown
      >;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] as Record<string, unknown>;
      }
      current[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const updateHours = (index: number, field: "day" | "hours", value: string) => {
    setSettings((prev) => {
      const next = structuredClone(prev);
      next.hours[index] = { ...next.hours[index]!, [field]: value };
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const urlError = validateProductionSiteUrl(settings.url);
    if (urlError) {
      toast.error(urlError);
      return;
    }

    const payload: SiteConfig = {
      ...settings,
      url: normalizeSiteUrl(settings.url),
      seo: {
        ...settings.seo,
        keywords: settings.seo.keywords.filter(Boolean),
      },
    };

    startTransition(async () => {
      const result = await upsertSiteSettings(
        payload as unknown as import("@/lib/supabase/types").Json,
      );
      if (result.success) {
        setSettings(payload);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white">General</h2>
          <p className="mt-1 text-sm text-white/60">
            Core site identity used across the public website.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Site name</Label>
            <Input
              id="name"
              value={settings.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={settings.tagline}
              onChange={(e) => updateField("tagline", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={settings.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="url">Site URL</Label>
            <Input
              id="url"
              value={settings.url}
              onChange={(e) => updateField("url", e.target.value)}
              placeholder="https://www.qtmdetailing.mt"
            />
            <p className="text-xs text-white/50">
              No trailing slash. Used for canonical URLs, sitemap, and social
              previews.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="locale">Locale</Label>
            <Input
              id="locale"
              value={settings.locale}
              onChange={(e) => updateField("locale", e.target.value)}
              placeholder="en_MT"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 border-t border-white/10 pt-8">
        <div>
          <h2 className="text-lg font-semibold text-white">SEO</h2>
          <p className="mt-1 text-sm text-white/60">
            Global search settings and AI discovery content.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="keywords">Keywords</Label>
          <Textarea
            id="keywords"
            rows={3}
            value={settings.seo.keywords.join(", ")}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                seo: {
                  ...prev.seo,
                  keywords: e.target.value
                    .split(",")
                    .map((keyword) => keyword.trim())
                    .filter(Boolean),
                },
              }))
            }
            placeholder="car detailing Malta, ceramic coating Malta"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="google-verification">Google site verification</Label>
            <Input
              id="google-verification"
              value={settings.seo.googleSiteVerification ?? ""}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  seo: {
                    ...prev.seo,
                    googleSiteVerification: e.target.value || undefined,
                  },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bing-verification">Bing site verification</Label>
            <Input
              id="bing-verification"
              value={settings.seo.bingSiteVerification ?? ""}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  seo: {
                    ...prev.seo,
                    bingSiteVerification: e.target.value || undefined,
                  },
                }))
              }
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price-range">Price range (schema markup)</Label>
            <Input
              id="price-range"
              value={settings.seo.priceRange ?? "€€"}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  seo: { ...prev.seo, priceRange: e.target.value },
                }))
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="llms-summary">LLMs.txt summary override</Label>
          <Textarea
            id="llms-summary"
            rows={3}
            value={settings.seo.llmsSummary ?? ""}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                seo: {
                  ...prev.seo,
                  llmsSummary: e.target.value || undefined,
                },
              }))
            }
            placeholder="Optional short summary for /llms.txt"
          />
        </div>
      </div>

      <div className="space-y-6 border-t border-white/10 pt-8">
        <div>
          <h2 className="text-lg font-semibold text-white">Contact</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={settings.contact.email}
              onChange={(e) => updateField("contact.email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={settings.contact.phone}
              onChange={(e) => updateField("contact.phone", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={settings.contact.whatsapp}
              onChange={(e) => updateField("contact.whatsapp", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={settings.contact.address}
              onChange={(e) => updateField("contact.address", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 border-t border-white/10 pt-8">
        <div>
          <h2 className="text-lg font-semibold text-white">Opening hours</h2>
          <p className="mt-1 text-sm text-white/60">
            Shown on the contact page and in search schema markup.
          </p>
        </div>

        <div className="space-y-3">
          {settings.hours.map((entry, index) => (
            <div key={`hours-${index}`} className="grid gap-3 sm:grid-cols-2">
              <Input
                value={entry.day}
                onChange={(e) => updateHours(index, "day", e.target.value)}
                placeholder="Monday – Friday"
              />
              <Input
                value={entry.hours}
                onChange={(e) => updateHours(index, "hours", e.target.value)}
                placeholder="09:00 – 19:00"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6 border-t border-white/10 pt-8">
        <div>
          <h2 className="text-lg font-semibold text-white">Social</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram URL</Label>
            <Input
              id="instagram"
              value={settings.social.instagram}
              onChange={(e) => updateField("social.instagram", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook URL</Label>
            <Input
              id="facebook"
              value={settings.social.facebook}
              onChange={(e) => updateField("social.facebook", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save settings"
          )}
        </Button>
      </div>
    </form>
  );
}

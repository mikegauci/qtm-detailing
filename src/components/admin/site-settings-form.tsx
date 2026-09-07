"use client";

import { useMemo, useState, useTransition } from "react";
import {
  ExternalLink,
  Globe,
  Loader2,
  Phone,
  Plus,
  Search,
  Share2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { upsertSiteSettings } from "@/app/actions/admin/cms";
import { EditorTabBar } from "@/components/admin/editor-tab-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { normalizeSiteUrl, validateProductionSiteUrl } from "@/lib/seo/site-url";
import { cn } from "@/lib/utils";
import type { SiteConfig } from "@/types/content";

type SiteSettingsFormProps = {
  initialSettings: SiteConfig;
};

type SettingsTab = "general" | "seo" | "contact" | "social";

function FieldGroup({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-5",
        className,
      )}
    >
      <div>
        <h3 className="text-sm font-medium text-white">{title}</h3>
        {description ? (
          <p className="mt-1 text-xs text-white/50">{description}</p>
        ) : null}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function HelperText({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-white/50">{children}</p>;
}

export function SiteSettingsForm({ initialSettings }: SiteSettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [savedSettings, setSavedSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [isPending, startTransition] = useTransition();

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings],
  );

  const publicBaseUrl = normalizeSiteUrl(settings.url);

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

  const addHoursRow = () => {
    setSettings((prev) => ({
      ...prev,
      hours: [...prev.hours, { day: "", hours: "" }],
    }));
  };

  const removeHoursRow = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      hours: prev.hours.filter((_, i) => i !== index),
    }));
  };

  const syncLlmsFromDescription = () => {
    setSettings((prev) => ({
      ...prev,
      seo: { ...prev.seo, llmsSummary: prev.description },
    }));
    toast.success("LLMs summary updated from site description.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const urlError = validateProductionSiteUrl(settings.url);
    if (urlError) {
      toast.error(urlError);
      setActiveTab("general");
      return;
    }

    const payload: SiteConfig = {
      ...settings,
      url: normalizeSiteUrl(settings.url),
      seo: {
        ...settings.seo,
        keywords: settings.seo.keywords.filter(Boolean),
        googleSiteVerification:
          settings.seo.googleSiteVerification?.trim() || undefined,
        bingSiteVerification:
          settings.seo.bingSiteVerification?.trim() || undefined,
      },
      hours: settings.hours.filter(
        (entry) => entry.day.trim() || entry.hours.trim(),
      ),
    };

    startTransition(async () => {
      const result = await upsertSiteSettings(
        payload as unknown as import("@/lib/supabase/types").Json,
      );
      if (result.success) {
        setSettings(payload);
        setSavedSettings(payload);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const tabs = [
    {
      id: "general" as const,
      label: "General",
      icon: <Globe className="h-4 w-4 shrink-0" />,
    },
    {
      id: "seo" as const,
      label: "SEO",
      icon: <Search className="h-4 w-4 shrink-0" />,
    },
    {
      id: "contact" as const,
      label: "Contact & hours",
      icon: <Phone className="h-4 w-4 shrink-0" />,
    },
    {
      id: "social" as const,
      label: "Social",
      icon: <Share2 className="h-4 w-4 shrink-0" />,
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <EditorTabBar
        variant="page"
        value={activeTab}
        onChange={setActiveTab}
        tabs={tabs}
      />

      {activeTab === "general" ? (
        <div className="space-y-4">
          <FieldGroup
            title="Site identity"
            description="Name and tagline appear in the header, footer, and default page titles."
          >
            <div className="grid gap-3 sm:grid-cols-2">
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
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="description">Site description</Label>
                <span className="text-xs text-white/40">
                  {settings.description.length} chars
                </span>
              </div>
              <Textarea
                id="description"
                value={settings.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
              />
              <HelperText>
                Used in search snippets, Open Graph defaults, and JSON-LD.
              </HelperText>
            </div>
          </FieldGroup>

          <FieldGroup
            title="Domain & locale"
            description="Production URL only — preview domains are blocked automatically."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="url">Site URL</Label>
                <Input
                  id="url"
                  value={settings.url}
                  onChange={(e) => updateField("url", e.target.value)}
                  placeholder="https://www.qtmdetailing.mt"
                />
                <HelperText>No trailing slash. Powers canonicals and sitemap.</HelperText>
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
            {publicBaseUrl ? (
              <a
                href={publicBaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-brand-cyan-400 hover:underline"
              >
                View live site
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </FieldGroup>
        </div>
      ) : null}

      {activeTab === "seo" ? (
        <div className="space-y-4">
          <FieldGroup
            title="Search keywords"
            description="Comma-separated phrases used in the global meta keywords tag."
          >
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
          </FieldGroup>

          <FieldGroup
            title="Search console verification"
            description="Paste the content value from Google Search Console or Bing Webmaster Tools."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="google-verification">Google</Label>
                <Input
                  id="google-verification"
                  value={settings.seo.googleSiteVerification ?? ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      seo: {
                        ...prev.seo,
                        googleSiteVerification: e.target.value,
                      },
                    }))
                  }
                  placeholder="google-site-verification=…"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bing-verification">Bing</Label>
                <Input
                  id="bing-verification"
                  value={settings.seo.bingSiteVerification ?? ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      seo: {
                        ...prev.seo,
                        bingSiteVerification: e.target.value,
                      },
                    }))
                  }
                  placeholder="msvalidate.01 content value"
                />
              </div>
            </div>
          </FieldGroup>

          <FieldGroup
            title="Structured data & AI discovery"
            description="Price range appears in local business schema. LLMs summary powers /llms.txt."
          >
            <div className="space-y-2">
              <Label htmlFor="price-range">Price range</Label>
              <Input
                id="price-range"
                value={settings.seo.priceRange ?? "€€"}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, priceRange: e.target.value },
                  }))
                }
                className="max-w-xs"
              />
              <HelperText>Schema.org priceRange, e.g. €, €€, or €€€.</HelperText>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="llms-summary">LLMs.txt summary</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={syncLlmsFromDescription}
                >
                  Copy from description
                </Button>
              </div>
              <Textarea
                id="llms-summary"
                rows={3}
                value={settings.seo.llmsSummary ?? ""}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    seo: {
                      ...prev.seo,
                      llmsSummary: e.target.value,
                    },
                  }))
                }
              />
              {publicBaseUrl ? (
                <a
                  href={`${publicBaseUrl}/llms.txt`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-brand-cyan-400 hover:underline"
                >
                  Preview /llms.txt
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          </FieldGroup>

          <HelperText>
            Per-page titles and descriptions are edited under Page Copy → SEO on
            each page.
          </HelperText>
        </div>
      ) : null}

      {activeTab === "contact" ? (
        <div className="space-y-4">
          <FieldGroup
            title="Contact details"
            description="Shown on the contact page, footer, and structured data."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
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
                <Label htmlFor="whatsapp">WhatsApp number</Label>
                <Input
                  id="whatsapp"
                  value={settings.contact.whatsapp}
                  onChange={(e) =>
                    updateField("contact.whatsapp", e.target.value)
                  }
                  placeholder="+356 9997 1101"
                />
                <HelperText>Display number shown to visitors.</HelperText>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={settings.contact.address}
                  onChange={(e) =>
                    updateField("contact.address", e.target.value)
                  }
                />
              </div>
            </div>
          </FieldGroup>

          <FieldGroup
            title="WhatsApp quote link"
            description="All “Request a Quote” buttons link here — not the contact page."
          >
            <div className="space-y-2">
              <Label htmlFor="whatsapp-url">WhatsApp URL</Label>
              <Input
                id="whatsapp-url"
                value={settings.contact.whatsappUrl}
                onChange={(e) =>
                  updateField("contact.whatsappUrl", e.target.value)
                }
                placeholder="https://wa.me/…"
              />
              {settings.contact.whatsappUrl ? (
                <a
                  href={settings.contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-brand-cyan-400 hover:underline"
                >
                  Test WhatsApp link
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          </FieldGroup>

          <FieldGroup
            title="Opening hours"
            description="Use formats like “Monday – Friday” and “09:00 – 19:00”. Closed days can say “Closed”."
          >
            <div className="hidden gap-3 sm:grid sm:grid-cols-[1fr_1fr_auto]">
              <Label className="text-xs text-white/50">Days</Label>
              <Label className="text-xs text-white/50">Hours</Label>
              <span className="sr-only">Remove</span>
            </div>
            <div className="space-y-2">
              {settings.hours.map((entry, index) => (
                <div
                  key={`hours-${index}`}
                  className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-center"
                >
                  <Input
                    value={entry.day}
                    onChange={(e) => updateHours(index, "day", e.target.value)}
                    placeholder="Monday – Friday"
                    aria-label={`Opening days row ${index + 1}`}
                  />
                  <Input
                    value={entry.hours}
                    onChange={(e) =>
                      updateHours(index, "hours", e.target.value)
                    }
                    placeholder="09:00 – 19:00"
                    aria-label={`Opening hours row ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeHoursRow(index)}
                    disabled={settings.hours.length <= 1}
                    aria-label={`Remove hours row ${index + 1}`}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addHoursRow}
              className="mt-1"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add hours row
            </Button>
          </FieldGroup>
        </div>
      ) : null}

      {activeTab === "social" ? (
        <FieldGroup
          title="Social profiles"
          description="Linked in the footer and local business schema (sameAs)."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={settings.social.instagram}
                onChange={(e) => updateField("social.instagram", e.target.value)}
                placeholder="https://instagram.com/…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={settings.social.facebook}
                onChange={(e) => updateField("social.facebook", e.target.value)}
                placeholder="https://facebook.com/…"
              />
            </div>
          </div>
        </FieldGroup>
      ) : null}

      <div className="sticky bottom-0 z-10 -mx-1 border-t border-white/10 bg-[#0a0a0f]/95 px-1 py-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            className={cn(
              "text-sm transition-opacity",
              isDirty ? "text-amber-300/90" : "text-white/40",
            )}
          >
            {isDirty ? "Unsaved changes" : "All changes saved"}
          </p>
          <div className="flex flex-wrap gap-2">
            {isDirty ? (
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  setSettings(savedSettings);
                  toast.message("Changes discarded.");
                }}
              >
                Discard
              </Button>
            ) : null}
            <Button type="submit" disabled={isPending || !isDirty}>
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
        </div>
      </div>
    </form>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { upsertSiteSettings } from "@/app/actions/admin/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await upsertSiteSettings(
        settings as unknown as import("@/lib/supabase/types").Json,
      );
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

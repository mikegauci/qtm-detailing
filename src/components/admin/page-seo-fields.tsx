"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { PageSeoContent } from "@/types/page-sections";

type PageSeoFieldsProps = {
  content: PageSeoContent;
  onChange: (content: PageSeoContent) => void;
  showNoindex?: boolean;
};

export function PageSeoFields({
  content,
  onChange,
  showNoindex = true,
}: PageSeoFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="seo-title">Meta title</Label>
        <Input
          id="seo-title"
          value={content.title}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          placeholder="Leave empty on Home to use the site default"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="seo-description">Meta description</Label>
        <Textarea
          id="seo-description"
          rows={3}
          value={content.description}
          onChange={(e) =>
            onChange({ ...content, description: e.target.value })
          }
          placeholder="Leave empty on Home to use the site description"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="seo-og-title">Open Graph title (optional)</Label>
        <Input
          id="seo-og-title"
          value={content.ogTitle ?? ""}
          onChange={(e) =>
            onChange({
              ...content,
              ogTitle: e.target.value || undefined,
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="seo-og-description">
          Open Graph description (optional)
        </Label>
        <Textarea
          id="seo-og-description"
          rows={2}
          value={content.ogDescription ?? ""}
          onChange={(e) =>
            onChange({
              ...content,
              ogDescription: e.target.value || undefined,
            })
          }
        />
      </div>

      {showNoindex ? (
        <label className="flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={content.noindex ?? false}
            onChange={(e) =>
              onChange({ ...content, noindex: e.target.checked })
            }
            className="rounded border-white/20"
          />
          Hide this page from search engines (noindex)
        </label>
      ) : null}
    </div>
  );
}

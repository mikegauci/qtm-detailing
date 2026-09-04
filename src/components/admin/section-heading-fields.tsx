import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SectionHeadingContent } from "@/types/page-sections";

type SectionHeadingFieldsProps = {
  content: SectionHeadingContent;
  onChange: (content: SectionHeadingContent) => void;
};

export function SectionHeadingFields({
  content,
  onChange,
}: SectionHeadingFieldsProps) {
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

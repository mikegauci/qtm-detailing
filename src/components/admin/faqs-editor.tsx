"use client";

import { useState } from "react";
import { deleteFaq, upsertFaq } from "@/app/actions/admin/cms";
import { CmsFormActions } from "@/components/admin/cms-form-actions";
import { CmsListEditor } from "@/components/admin/cms-list-editor";
import { CmsListItemButton } from "@/components/admin/cms-list-item-button";
import type { Tables } from "@/lib/supabase/types";
import { useServerAction } from "@/hooks/use-server-action";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type FaqsEditorProps = {
  initialFaqs: Tables<"faqs">[];
};

type FaqFormState = {
  id?: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_active: boolean;
};

const empty: FaqFormState = {
  question: "",
  answer: "",
  category: "",
  sort_order: 0,
  is_active: true,
};

export function FaqsEditor({ initialFaqs }: FaqsEditorProps) {
  const { run, isPending } = useServerAction();
  const [faqs, setFaqs] = useState(initialFaqs);
  const [editing, setEditing] = useState<FaqFormState>(empty);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    run(
      () =>
        upsertFaq({
          id: editing.id,
          question: editing.question,
          answer: editing.answer,
          category: editing.category || undefined,
          sort_order: Number(editing.sort_order),
          is_active: editing.is_active,
        }),
      { refresh: true },
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    run(() => deleteFaq(id), {
      onSuccess: () => setFaqs((prev) => prev.filter((f) => f.id !== id)),
    });
  };

  return (
    <CmsListEditor
      listTitle="FAQs"
      formTitle={editing.id ? "Edit FAQ" : "New FAQ"}
      onNew={() => setEditing(empty)}
      list={
        <>
          {faqs.map((faq) => (
            <CmsListItemButton
              key={faq.id}
              title={faq.question}
              badge={!faq.is_active ? <Badge variant="outline">Inactive</Badge> : undefined}
              onClick={() =>
                setEditing({
                  id: faq.id,
                  question: faq.question,
                  answer: faq.answer,
                  category: faq.category ?? "",
                  sort_order: faq.sort_order,
                  is_active: faq.is_active,
                })
              }
            />
          ))}
        </>
      }
      form={
        <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-2">
          <Label>Question</Label>
          <Input
            value={editing.question}
            onChange={(e) =>
              setEditing((p) => ({ ...p, question: e.target.value }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Answer</Label>
          <Textarea
            value={editing.answer}
            onChange={(e) =>
              setEditing((p) => ({ ...p, answer: e.target.value }))
            }
            rows={5}
            required
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Input
              value={editing.category ?? ""}
              onChange={(e) =>
                setEditing((p) => ({ ...p, category: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Sort order</Label>
            <Input
              type="number"
              value={editing.sort_order ?? 0}
              onChange={(e) =>
                setEditing((p) => ({
                  ...p,
                  sort_order: Number(e.target.value),
                }))
              }
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={editing.is_active ?? true}
            onChange={(e) =>
              setEditing((p) => ({ ...p, is_active: e.target.checked }))
            }
          />
          Active
        </label>
        <CmsFormActions
          isPending={isPending}
          saveLabel="Save FAQ"
          onDelete={editing.id ? () => handleDelete(editing.id!) : undefined}
        />
        </form>
      }
    />
  );
}

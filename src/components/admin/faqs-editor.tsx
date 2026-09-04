"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteFaq, upsertFaq } from "@/app/actions/admin/cms";
import { CmsListEditor } from "@/components/admin/cms-list-editor";
import type { Tables } from "@/lib/supabase/types";
import { useServerAction } from "@/hooks/use-server-action";
import { Button } from "@/components/ui/button";
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
            <button
              key={faq.id}
              type="button"
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
              className="w-full rounded-lg border border-white/10 p-3 text-left hover:bg-white/5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{faq.question}</p>
                {!faq.is_active && <Badge variant="outline">Inactive</Badge>}
              </div>
            </button>
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
        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save FAQ"
            )}
          </Button>
          {editing.id && (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDelete(editing.id!)}
              disabled={isPending}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
        </form>
      }
    />
  );
}

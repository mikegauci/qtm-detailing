"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteFaq, upsertFaq } from "@/app/actions/admin/cms";
import type { Tables } from "@/lib/supabase/types";
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
  const router = useRouter();
  const [faqs, setFaqs] = useState(initialFaqs);
  const [editing, setEditing] = useState<FaqFormState>(empty);
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await upsertFaq({
        id: editing.id,
        question: editing.question,
        answer: editing.answer,
        category: editing.category || undefined,
        sort_order: Number(editing.sort_order),
        is_active: editing.is_active,
      });
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else toast.error(result.message);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    startTransition(async () => {
      const result = await deleteFaq(id);
      if (result.success) {
        toast.success(result.message);
        setFaqs((prev) => prev.filter((f) => f.id !== id));
      } else toast.error(result.message);
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">FAQs</h2>
          <Button size="sm" variant="outline" onClick={() => setEditing(empty)}>
            <Plus className="mr-1 h-3 w-3" />
            New
          </Button>
        </div>
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
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-xl border border-white/10 p-5"
      >
        <h2 className="text-lg font-semibold">
          {editing.id ? "Edit FAQ" : "New FAQ"}
        </h2>
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
    </div>
  );
}

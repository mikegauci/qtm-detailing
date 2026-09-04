import { requireAdmin } from "@/lib/supabase/admin";
import { getAdminFaqs } from "@/app/actions/admin/cms";
import { FaqsEditorLazy } from "@/components/admin/lazy/faqs-editor-lazy";

export default async function AdminFaqsPage() {
  const { supabase } = await requireAdmin();
  const faqs = await getAdminFaqs(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">FAQ</h1>
        <p className="mt-1 text-white/60">
          Manage frequently asked questions on the services page.
        </p>
      </div>
      <FaqsEditorLazy initialFaqs={faqs} />
    </div>
  );
}

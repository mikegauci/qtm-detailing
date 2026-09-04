import { requireAdmin } from "@/lib/supabase/admin";
import { getAdminTestimonials } from "@/app/actions/admin/cms";
import { TestimonialsEditorLazy } from "@/components/admin/lazy/testimonials-editor-lazy";

export default async function AdminTestimonialsPage() {
  const { supabase } = await requireAdmin();
  const testimonials = await getAdminTestimonials(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Testimonials</h1>
        <p className="mt-1 text-white/60">
          Manage customer reviews displayed on the homepage.
        </p>
      </div>
      <TestimonialsEditorLazy initialTestimonials={testimonials} />
    </div>
  );
}

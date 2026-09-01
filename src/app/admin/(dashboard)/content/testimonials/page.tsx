import { requireAdmin } from "@/lib/supabase/admin";
import { getAdminTestimonials } from "@/app/actions/admin/cms";
import { TestimonialsEditor } from "@/components/admin/testimonials-editor";

export default async function AdminTestimonialsPage() {
  await requireAdmin();
  const testimonials = await getAdminTestimonials();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Testimonials</h1>
        <p className="mt-1 text-white/60">
          Manage customer reviews displayed on the homepage.
        </p>
      </div>
      <TestimonialsEditor initialTestimonials={testimonials} />
    </div>
  );
}

import { requireAdmin } from "@/lib/supabase/admin";
import { getAdminServices } from "@/app/actions/admin/cms";
import { ServicesEditorLazy } from "@/components/admin/lazy/services-editor-lazy";

export const maxDuration = 300;

export default async function AdminServicesPage() {
  const { supabase } = await requireAdmin();
  const services = await getAdminServices(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Services</h1>
        <p className="mt-1 text-white/60">
          Manage detailing services shown on the services page and homepage.
        </p>
      </div>
      <ServicesEditorLazy initialServices={services} />
    </div>
  );
}

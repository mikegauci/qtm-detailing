import { requireAdmin } from "@/lib/supabase/admin";
import { getAdminServices } from "@/app/actions/admin/cms";
import { ServicesEditor } from "@/components/admin/services-editor";

export default async function AdminServicesPage() {
  await requireAdmin();
  const services = await getAdminServices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Services</h1>
        <p className="mt-1 text-white/60">
          Manage detailing services shown on the services page and homepage.
        </p>
      </div>
      <ServicesEditor initialServices={services} />
    </div>
  );
}

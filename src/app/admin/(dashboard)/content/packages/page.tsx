import { requireAdmin } from "@/lib/supabase/admin";
import { getAdminPackages } from "@/app/actions/admin/cms";
import { PackagesEditor } from "@/components/admin/packages-editor";

export default async function AdminPackagesPage() {
  await requireAdmin();
  const { packages, features } = await getAdminPackages();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Packages</h1>
        <p className="mt-1 text-white/60">
          Edit pricing packages and the comparison matrix on the services page.
        </p>
      </div>
      <PackagesEditor
        initialPackages={packages}
        initialFeatures={features}
      />
    </div>
  );
}

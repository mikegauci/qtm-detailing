import { requireAdmin } from "@/lib/supabase/admin";
import { getAdminPackages } from "@/app/actions/admin/cms";
import { PackagesEditor } from "@/components/admin/packages-editor";
import { getServices } from "@/lib/content/get-services";
import { resolvePackageRecordsForAdmin } from "@/lib/content/get-packages";

export default async function AdminPackagesPage() {
  await requireAdmin();
  const [{ packages, features }, services] = await Promise.all([
    getAdminPackages(),
    getServices({ includeInactive: true }),
  ]);
  const resolvedPackages = resolvePackageRecordsForAdmin(
    packages,
    features,
    services,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Packages</h1>
        <p className="mt-1 text-white/60">
          Edit pricing packages and the comparison matrix on the services page.
          Includes and feature lists are synced from linked bundle services on
          the public site.
        </p>
      </div>
      <PackagesEditor
        initialPackages={resolvedPackages}
        initialFeatures={features}
      />
    </div>
  );
}

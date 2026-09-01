import { requireAdmin } from "@/lib/supabase/admin";
import { LeadsManager } from "@/components/admin/leads-manager";

export default async function LeadsPage() {
  const { supabase } = await requireAdmin();

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Leads</h1>
        <p className="mt-1 text-sm text-white/60">
          Manage inbound enquiries from the website and other sources.
        </p>
      </div>

      <LeadsManager leads={leads ?? []} />
    </div>
  );
}

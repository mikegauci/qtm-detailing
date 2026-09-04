import { Suspense } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface-base text-white">
      <Suspense fallback={<div className="hidden w-64 shrink-0 lg:block" />}>
        <AdminSidebar />
      </Suspense>
      <main className="min-w-0 flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

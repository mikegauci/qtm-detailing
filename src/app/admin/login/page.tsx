import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base px-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-surface-raised p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">QTM Admin</h1>
          <p className="mt-2 text-sm text-white/60">Sign in to manage your site</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/admin";
import { isDriveConnected } from "@/lib/google-drive";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function GoogleDriveSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  await requireAdmin();
  const connected = await isDriveConnected();
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Google Drive</h1>
        <p className="mt-1 text-white/60">
          Connect your Google account to browse Drive folders and import gallery
          photos.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-surface-raised/40 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Connection status</p>
            <p className="text-sm text-white/60">
              Required scopes: read-only access to Drive files.
            </p>
          </div>
          <Badge variant={connected ? "default" : "outline"}>
            {connected ? "Connected" : "Not connected"}
          </Badge>
        </div>

        {params.connected === "1" && (
          <p className="mt-4 text-sm text-brand-cyan-400">
            Google Drive connected successfully.
          </p>
        )}
        {params.error && (
          <p className="mt-4 text-sm text-red-400">
            Error: {decodeURIComponent(params.error)}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          {!connected ? (
            <Button asChild>
              <a href="/api/google-drive/auth">Connect Google Drive</a>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/admin/gallery">Open Gallery Hub</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-surface-raised/20 p-5 text-sm text-white/60">
        <p className="font-medium text-white">Setup</p>
        <ol className="mt-2 list-inside list-decimal space-y-1">
          <li>Create OAuth credentials in Google Cloud Console.</li>
          <li>
            Set redirect URI to{" "}
            <code className="text-brand-cyan-400">
              {process.env.GOOGLE_REDIRECT_URI ?? "GOOGLE_REDIRECT_URI"}
            </code>
          </li>
          <li>Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your env.</li>
        </ol>
      </div>
    </div>
  );
}

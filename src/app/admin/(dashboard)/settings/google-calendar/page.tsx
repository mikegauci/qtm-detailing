import { requireAdmin } from "@/lib/supabase/admin";
import { getCalendarConnection } from "@/lib/google-calendar";
import { GoogleCalendarSettingsActions } from "@/components/admin/google-calendar-settings-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function formatSyncedAt(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Malta",
  }).format(date);
}

export default async function GoogleCalendarSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  await requireAdmin();
  const connection = await getCalendarConnection();
  const params = await searchParams;
  const lastSyncedAt = formatSyncedAt(connection.lastSyncedAt);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Google Calendar</h1>
        <p className="mt-1 text-white/60">
          Push QTM bookings to a shared QTM Bookings calendar for both Gmail
          accounts. Events you add only in Google stay on Google.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-surface-raised/40 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">Connection status</p>
            <p className="text-sm text-white/60">
              Creates a shared calendar and keeps it in sync when bookings
              change here.
            </p>
          </div>
          <Badge variant={connection.connected ? "default" : "outline"}>
            {connection.connected ? "Connected" : "Not connected"}
          </Badge>
        </div>

        {connection.connected && (
          <dl className="mt-4 space-y-2 text-sm">
            {connection.connectedEmail && (
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">Connected as</dt>
                <dd>{connection.connectedEmail}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-white/60">Calendar</dt>
              <dd>{connection.calendarName ?? "QTM Bookings"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/60">Shared with</dt>
              <dd className="text-right">
                {connection.shareEmails.join(", ")}
              </dd>
            </div>
            {lastSyncedAt && (
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">Last synced</dt>
                <dd>{lastSyncedAt}</dd>
              </div>
            )}
          </dl>
        )}

        {params.connected === "1" && (
          <p className="mt-4 text-sm text-brand-cyan-400">
            Google Calendar connected. Sync existing bookings, then ask the
            other Gmail account to accept QTM Bookings under Other calendars.
          </p>
        )}
        {params.error && (
          <p className="mt-4 text-sm text-red-400">
            Error: {decodeURIComponent(params.error)}
          </p>
        )}
        {connection.lastError && (
          <p className="mt-4 text-sm text-red-400">
            Last sync error: {connection.lastError}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <a href="/api/google-calendar/auth">
              {connection.connected ? "Reconnect" : "Connect Google Calendar"}
            </a>
          </Button>
        </div>

        <GoogleCalendarSettingsActions
          connected={connection.connected}
          hasCalendar={Boolean(connection.calendarId)}
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-surface-raised/20 p-5 text-sm text-white/60">
        <p className="font-medium text-white">Setup</p>
        <ol className="mt-2 list-inside list-decimal space-y-1">
          <li>Enable the Google Calendar API in the same Google Cloud project used for Drive.</li>
          <li>
            Add this redirect URI to the OAuth client:{" "}
            <code className="text-brand-cyan-400">
              {process.env.GOOGLE_CALENDAR_REDIRECT_URI ??
                "GOOGLE_CALENDAR_REDIRECT_URI"}
            </code>
          </li>
          <li>
            Add GOOGLE_CALENDAR_REDIRECT_URI to your env. Drive keeps
            GOOGLE_REDIRECT_URI.
          </li>
          <li>
            Connect with one Gmail account. The other account accepts the
            QTM Bookings share in Google Calendar.
          </li>
        </ol>
      </div>
    </div>
  );
}

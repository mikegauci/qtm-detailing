"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  disconnectGoogleCalendar,
  retryGoogleCalendarSetup,
  syncExistingGoogleCalendarBookings,
} from "@/app/actions/admin/google-calendar";
import { Button } from "@/components/ui/button";

export function GoogleCalendarSettingsActions({
  connected,
  hasCalendar,
}: {
  connected: boolean;
  hasCalendar: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [action, setAction] = useState<"setup" | "sync" | "disconnect" | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(
    kind: "setup" | "sync" | "disconnect",
    fn: () => Promise<{ success: boolean; message: string }>,
  ) {
    if (kind === "disconnect") {
      const confirmed = window.confirm(
        "Disconnect Google Calendar? Bookings will stop updating in Google. Existing events stay on the QTM Bookings calendar.",
      );
      if (!confirmed) return;
    }

    setAction(kind);
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result.success) {
        setMessage(result.message);
      } else {
        setError(result.message);
      }
      setAction(null);
      router.refresh();
    });
  }

  if (!connected) return null;

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-wrap gap-3">
        {!hasCalendar && (
          <Button
            type="button"
            disabled={isPending}
            onClick={() => run("setup", retryGoogleCalendarSetup)}
          >
            {action === "setup" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Finish calendar setup
          </Button>
        )}
        {hasCalendar && (
          <Button
            type="button"
            disabled={isPending}
            onClick={() => run("sync", syncExistingGoogleCalendarBookings)}
          >
            {action === "sync" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Sync existing bookings
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => run("disconnect", disconnectGoogleCalendar)}
        >
          {action === "disconnect" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          Disconnect
        </Button>
      </div>
      {message && <p className="text-sm text-brand-cyan-400">{message}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

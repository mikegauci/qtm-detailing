import { addDays, format, parseISO } from "date-fns";
import { google } from "googleapis";
import { getCustomerRelation, getRelation } from "@/lib/admin/supabase-relations";
import { getOptionalSiteUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import { BOOKING_STATUS_LABELS } from "@/lib/utils/booking";
import { formatBookingVehiclesLabel } from "@/lib/utils/booking-vehicles";
import { joinSiteUrl } from "@/lib/seo/site-url";

const PROVIDER = "google_calendar";
const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/userinfo.email",
];
const CALENDAR_NAME = "QTM Bookings";
const CALENDAR_TIMEZONE = "Europe/Malta";

export const GOOGLE_CALENDAR_SHARE_EMAILS = [
  "mikegauci@gmail.com",
  "max.messina13@gmail.com",
] as const;

const STATUS_COLOR_IDS: Record<string, string> = {
  booked: "9",
  in_progress: "5",
  completed: "10",
  paid: "3",
};

const BOOKING_SYNC_SELECT =
  "id, booking_date, end_date, status, notes, confirmation_code, google_event_id, customers(full_name), booking_vehicles(vehicles(make, model)), booking_services(services(name))";

export type GoogleCalendarMetadata = {
  calendar_id?: string;
  calendar_name?: string;
  connected_email?: string;
  shared_with?: string[];
  last_error?: string | null;
  last_synced_at?: string | null;
};

export type GoogleCalendarConnection = {
  connected: boolean;
  calendarId: string | null;
  calendarName: string | null;
  connectedEmail: string | null;
  sharedWith: string[];
  lastError: string | null;
  lastSyncedAt: string | null;
  shareEmails: readonly string[];
};

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Missing Google OAuth env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALENDAR_REDIRECT_URI",
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getCalendarOAuthUrl(state?: string): string {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
  });
}

export async function exchangeCalendarCode(code: string) {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  return tokens;
}

function parseMetadata(raw: Json | null | undefined): GoogleCalendarMetadata {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const obj = raw as Record<string, Json | undefined>;
  return {
    calendar_id:
      typeof obj.calendar_id === "string" ? obj.calendar_id : undefined,
    calendar_name:
      typeof obj.calendar_name === "string" ? obj.calendar_name : undefined,
    connected_email:
      typeof obj.connected_email === "string"
        ? obj.connected_email
        : undefined,
    shared_with: Array.isArray(obj.shared_with)
      ? obj.shared_with.filter((value): value is string => typeof value === "string")
      : undefined,
    last_error:
      typeof obj.last_error === "string"
        ? obj.last_error
        : obj.last_error === null
          ? null
          : undefined,
    last_synced_at:
      typeof obj.last_synced_at === "string"
        ? obj.last_synced_at
        : undefined,
  };
}

async function loadStoredTokens() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("integration_tokens")
    .select("*")
    .eq("provider", PROVIDER)
    .maybeSingle();

  return data;
}

async function patchMetadata(patch: Partial<GoogleCalendarMetadata>) {
  const stored = await loadStoredTokens();
  if (!stored) return;

  const next = { ...parseMetadata(stored.metadata), ...patch };
  const supabase = await createClient();
  await supabase
    .from("integration_tokens")
    .update({
      metadata: next as Json,
      updated_at: new Date().toISOString(),
    })
    .eq("provider", PROVIDER);
}

async function recordSyncError(err: unknown) {
  await patchMetadata({ last_error: googleErrorMessage(err) });
}

function googleErrorMessage(err: unknown): string {
  if (!err || typeof err !== "object") {
    return "Google Calendar request failed.";
  }

  const error = err as {
    message?: string;
    response?: { data?: { error?: { message?: string } } };
  };

  return (
    error.response?.data?.error?.message ||
    error.message ||
    "Google Calendar request failed."
  );
}

function googleStatus(err: unknown): number | undefined {
  if (!err || typeof err !== "object") return undefined;
  const error = err as {
    code?: number | string;
    status?: number;
    response?: { status?: number };
  };
  const code = error.response?.status ?? error.status ?? error.code;
  return typeof code === "number" ? code : Number(code) || undefined;
}

function isNotFound(err: unknown): boolean {
  const status = googleStatus(err);
  return status === 404 || status === 410;
}

function isConflict(err: unknown): boolean {
  return googleStatus(err) === 409;
}

async function getAuthenticatedOAuthClient() {
  const client = getOAuthClient();
  const stored = await loadStoredTokens();

  if (!stored?.access_token) {
    throw new Error("Google Calendar is not connected.");
  }

  client.setCredentials({
    access_token: stored.access_token,
    refresh_token: stored.refresh_token ?? undefined,
    expiry_date: stored.expires_at
      ? new Date(stored.expires_at).getTime()
      : undefined,
  });

  client.on("tokens", async (tokens) => {
    const supabase = await createClient();
    await supabase.from("integration_tokens").upsert({
      provider: PROVIDER,
      access_token: tokens.access_token ?? stored.access_token,
      refresh_token: tokens.refresh_token ?? stored.refresh_token,
      expires_at: tokens.expiry_date
        ? new Date(tokens.expiry_date).toISOString()
        : stored.expires_at,
      updated_at: new Date().toISOString(),
    });
  });

  return client;
}

export async function saveCalendarTokens(tokens: {
  access_token?: string | null;
  refresh_token?: string | null;
  expiry_date?: number | null;
}) {
  const stored = await loadStoredTokens();
  const supabase = await createClient();
  await supabase.from("integration_tokens").upsert({
    provider: PROVIDER,
    access_token: tokens.access_token ?? stored?.access_token ?? null,
    refresh_token: tokens.refresh_token ?? stored?.refresh_token ?? null,
    expires_at: tokens.expiry_date
      ? new Date(tokens.expiry_date).toISOString()
      : stored?.expires_at ?? null,
    metadata: stored?.metadata ?? null,
    updated_at: new Date().toISOString(),
  });
}

export async function isCalendarConnected(): Promise<boolean> {
  const stored = await loadStoredTokens();
  return Boolean(stored?.refresh_token || stored?.access_token);
}

export async function getCalendarConnection(): Promise<GoogleCalendarConnection> {
  const stored = await loadStoredTokens();
  const metadata = parseMetadata(stored?.metadata);
  const connected = Boolean(stored?.refresh_token || stored?.access_token);

  return {
    connected,
    calendarId: metadata.calendar_id ?? null,
    calendarName: metadata.calendar_name ?? (connected ? CALENDAR_NAME : null),
    connectedEmail: metadata.connected_email ?? null,
    sharedWith: metadata.shared_with ?? [],
    lastError: metadata.last_error ?? null,
    lastSyncedAt: metadata.last_synced_at ?? null,
    shareEmails: GOOGLE_CALENDAR_SHARE_EMAILS,
  };
}

export async function setupSharedCalendar(): Promise<void> {
  const auth = await getAuthenticatedOAuthClient();
  const calendar = google.calendar({ version: "v3", auth });
  const stored = await loadStoredTokens();
  const metadata = parseMetadata(stored?.metadata);

  const oauth2 = google.oauth2({ version: "v2", auth });
  const { data: profile } = await oauth2.userinfo.get();
  const connectedEmail = profile.email?.trim().toLowerCase() || null;

  let calendarId = metadata.calendar_id;
  if (calendarId) {
    try {
      await calendar.calendars.get({ calendarId });
    } catch (err) {
      if (!isNotFound(err)) throw err;
      calendarId = undefined;
    }
  }

  if (!calendarId) {
    const { data } = await calendar.calendars.insert({
      requestBody: {
        summary: CALENDAR_NAME,
        timeZone: CALENDAR_TIMEZONE,
      },
    });
    if (!data.id) {
      throw new Error("Google Calendar did not return a calendar id.");
    }
    calendarId = data.id;
  }

  const sharedWith: string[] = [];
  const shareErrors: string[] = [];

  for (const email of GOOGLE_CALENDAR_SHARE_EMAILS) {
    if (connectedEmail && email.toLowerCase() === connectedEmail) {
      sharedWith.push(email);
      continue;
    }

    try {
      await calendar.acl.insert({
        calendarId,
        sendNotifications: true,
        requestBody: {
          role: "reader",
          scope: { type: "user", value: email },
        },
      });
      sharedWith.push(email);
    } catch (err) {
      if (isConflict(err)) {
        sharedWith.push(email);
      } else {
        shareErrors.push(`${email}: ${googleErrorMessage(err)}`);
      }
    }
  }

  await patchMetadata({
    calendar_id: calendarId,
    calendar_name: CALENDAR_NAME,
    connected_email: connectedEmail ?? undefined,
    shared_with: sharedWith,
    last_error: shareErrors.length > 0 ? shareErrors.join(" ") : null,
  });

  if (shareErrors.length > 0) {
    throw new Error(
      `Calendar created, but sharing failed. ${shareErrors.join(" ")}`,
    );
  }
}

export async function disconnectGoogleCalendarConnection(): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("bookings")
    .update({ google_event_id: null })
    .not("google_event_id", "is", null);
  await supabase.from("integration_tokens").delete().eq("provider", PROVIDER);
}

function formatServiceLabel(
  bookingServices:
    | { services: { name: string } | { name: string }[] | null }[]
    | null
    | undefined,
): string | null {
  if (!bookingServices?.length) return null;
  const names = bookingServices
    .map((row) => getRelation(row.services)?.name)
    .filter((name): name is string => Boolean(name));
  return names.length > 0 ? names.join(", ") : null;
}

function buildEventBody(booking: {
  id: string;
  booking_date: string;
  end_date: string | null;
  status: string;
  notes: string | null;
  confirmation_code: string;
  customers: { full_name: string } | { full_name: string }[] | null;
  booking_vehicles:
    | { vehicles: { make: string | null; model: string | null } | { make: string | null; model: string | null }[] | null }[]
    | null;
  booking_services:
    | { services: { name: string } | { name: string }[] | null }[]
    | null;
}) {
  const customerName =
    getCustomerRelation(booking.customers)?.full_name ?? "Booking";
  const serviceLabel = formatServiceLabel(booking.booking_services);
  const vehicleLabel = formatBookingVehiclesLabel(booking.booking_vehicles);
  const endDate = booking.end_date ?? booking.booking_date;
  const statusLabel = BOOKING_STATUS_LABELS[booking.status] ?? booking.status;

  const lines = [
    vehicleLabel !== "—" ? `Vehicles: ${vehicleLabel}` : null,
    `Status: ${statusLabel}`,
    `Confirmation: ${booking.confirmation_code}`,
    booking.notes?.trim() ? `Notes: ${booking.notes.trim()}` : null,
  ].filter((line): line is string => Boolean(line));

  const siteUrl = getOptionalSiteUrl();
  if (siteUrl) {
    lines.push(`Admin: ${joinSiteUrl(siteUrl, `/admin/bookings/${booking.id}`)}`);
  }

  return {
    summary: serviceLabel ? `${customerName} · ${serviceLabel}` : customerName,
    description: lines.join("\n"),
    start: { date: booking.booking_date },
    end: { date: format(addDays(parseISO(endDate), 1), "yyyy-MM-dd") },
    colorId: STATUS_COLOR_IDS[booking.status],
    extendedProperties: {
      private: { qtmBookingId: booking.id },
    },
  };
}

async function getCalendarApi() {
  const stored = await loadStoredTokens();
  if (!stored?.access_token && !stored?.refresh_token) {
    return null;
  }

  const metadata = parseMetadata(stored.metadata);
  if (!metadata.calendar_id) {
    return null;
  }

  const auth = await getAuthenticatedOAuthClient();
  return {
    calendar: google.calendar({ version: "v3", auth }),
    calendarId: metadata.calendar_id,
  };
}

async function deleteCalendarEvent(
  calendar: ReturnType<typeof google.calendar>,
  calendarId: string,
  eventId: string,
) {
  try {
    await calendar.events.delete({ calendarId, eventId });
  } catch (err) {
    if (!isNotFound(err)) throw err;
  }
}

export async function removeGoogleCalendarEvent(
  eventId: string | null | undefined,
): Promise<void> {
  if (!eventId) return;

  try {
    const api = await getCalendarApi();
    if (!api) return;
    await deleteCalendarEvent(api.calendar, api.calendarId, eventId);
  } catch (err) {
    await recordSyncError(err);
  }
}

export async function syncBookingToGoogleCalendar(
  bookingId: string,
): Promise<boolean> {
  try {
    const api = await getCalendarApi();
    if (!api) return true;

    const supabase = await createClient();
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(BOOKING_SYNC_SELECT)
      .eq("id", bookingId)
      .maybeSingle();

    if (error) throw error;
    if (!booking) return true;

    if (booking.status === "cancelled") {
      if (booking.google_event_id) {
        await deleteCalendarEvent(
          api.calendar,
          api.calendarId,
          booking.google_event_id,
        );
        await supabase
          .from("bookings")
          .update({ google_event_id: null })
          .eq("id", bookingId);
      }
      await patchMetadata({
        last_error: null,
        last_synced_at: new Date().toISOString(),
      });
      return true;
    }

    const eventBody = buildEventBody(booking);
    let eventId = booking.google_event_id;

    if (eventId) {
      try {
        await api.calendar.events.patch({
          calendarId: api.calendarId,
          eventId,
          requestBody: eventBody,
        });
      } catch (err) {
        if (!isNotFound(err)) throw err;
        eventId = null;
      }
    }

    if (!eventId) {
      const { data } = await api.calendar.events.insert({
        calendarId: api.calendarId,
        requestBody: eventBody,
      });
      if (!data.id) {
        throw new Error("Google Calendar did not return an event id.");
      }
      await supabase
        .from("bookings")
        .update({ google_event_id: data.id })
        .eq("id", bookingId);
    }

    await patchMetadata({
      last_error: null,
      last_synced_at: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    await recordSyncError(err);
    return false;
  }
}

export async function syncAllBookingsToGoogleCalendar(): Promise<{
  synced: number;
  failed: number;
}> {
  const connected = await isCalendarConnected();
  if (!connected) {
    throw new Error("Google Calendar is not connected.");
  }

  const stored = await loadStoredTokens();
  const metadata = parseMetadata(stored?.metadata);
  if (!metadata.calendar_id) {
    await setupSharedCalendar();
  }

  const supabase = await createClient();
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("id")
    .neq("status", "cancelled");

  if (error) {
    throw error;
  }

  let synced = 0;
  let failed = 0;

  for (const booking of bookings ?? []) {
    const ok = await syncBookingToGoogleCalendar(booking.id);
    if (ok) {
      synced += 1;
    } else {
      failed += 1;
    }
  }

  return { synced, failed };
}

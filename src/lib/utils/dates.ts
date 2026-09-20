import { format } from "date-fns";

const BUSINESS_TIMEZONE = "Europe/Malta";

export function getBusinessToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
  }).format(new Date());
}

export function parseDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`);
}

export function formatDisplayDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return format(date, "d MMM yyyy");
}

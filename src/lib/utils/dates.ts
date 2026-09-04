import { format } from "date-fns";

export function formatDisplayDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return format(date, "d MMM yyyy");
}

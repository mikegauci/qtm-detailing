import { formatDisplayDate } from "@/lib/utils/dates";

export function generateConfirmationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "QTM-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  booked: "Booked",
  in_progress: "In Progress",
  completed: "Completed",
  paid: "Paid",
  cancelled: "Cancelled",
};

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  booked: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  in_progress: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  completed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  paid: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
};

export const LEAD_STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  converted: "Converted",
  lost: "Lost",
};

export const LEAD_POTENTIAL_STATUSES = ["new", "contacted", "quoted"] as const;

const DEFAULT_BOOKING_START_TIME = "00:00:00";
const DEFAULT_BOOKING_END_TIME = "23:59:59";

export { DEFAULT_BOOKING_START_TIME, DEFAULT_BOOKING_END_TIME };

export function getBookingEndDate(
  startDate: string,
  endDate?: string | null,
): string {
  return endDate ?? startDate;
}

export function validateBookingDateRange(
  bookingDate: string,
  endDate?: string | null,
): string | null {
  const end = getBookingEndDate(bookingDate, endDate);
  if (end < bookingDate) {
    return "End date must be on or after start date.";
  }
  return null;
}

export function formatCustomerOptionLabel(customer: {
  full_name: string;
  email?: string | null;
  phone?: string | null;
}): string {
  const contact = customer.email ?? customer.phone;
  return contact ? `${customer.full_name} (${contact})` : customer.full_name;
}

export function formatBookingDateRange(
  startDate: string,
  endDate?: string | null,
): string {
  const end = endDate ?? startDate;
  const startLabel = formatDisplayDate(new Date(`${startDate}T12:00:00`));
  if (end === startDate) return startLabel;
  const endLabel = formatDisplayDate(new Date(`${end}T12:00:00`));
  return `${startLabel} – ${endLabel}`;
}

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  website: "Website",
  word_of_mouth: "Word of mouth",
  friend_family: "Friend / Family",
  phone: "Phone call",
  referral: "Referral",
  walk_in: "Walk-in",
  other: "Other",
};

export const LEAD_SOURCE_OPTIONS = Object.keys(LEAD_SOURCE_LABELS).filter(
  (source) => source !== "website",
);

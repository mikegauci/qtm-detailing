"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { updateBookingStatus } from "@/app/actions/admin/bookings";
import type { Enums } from "@/lib/supabase/types";
import { BOOKING_STATUS_LABELS, formatBookingDateRange } from "@/lib/utils/booking";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BookingStatus = Enums<"booking_status">;

type KanbanBooking = {
  id: string;
  confirmation_code: string;
  booking_date: string;
  end_date: string | null;
  customer_name: string;
  status: BookingStatus;
};

const COLUMNS = ["booked", "in_progress", "completed"] as const satisfies readonly BookingStatus[];

type KanbanColumnStatus = (typeof COLUMNS)[number];

const COLUMN_COLORS: Record<KanbanColumnStatus, string> = {
  booked: "border-blue-500/30 bg-blue-500/5",
  in_progress: "border-amber-500/30 bg-amber-500/5",
  completed: "border-emerald-500/30 bg-emerald-500/5",
};

function getBookingSortDate(booking: KanbanBooking): number {
  const date = booking.end_date ?? booking.booking_date;
  return new Date(`${date}T12:00:00`).getTime();
}

function getBookingsByStatus(
  bookings: KanbanBooking[],
  status: BookingStatus,
) {
  const filtered = bookings.filter((b) => b.status === status);

  if (status === "completed") {
    return [...filtered].sort(
      (a, b) => getBookingSortDate(b) - getBookingSortDate(a),
    );
  }

  return filtered;
}

function KanbanBookingCard({
  booking,
  isPending,
  onStatusChange,
}: {
  booking: KanbanBooking;
  isPending: boolean;
  onStatusChange: (bookingId: string, status: KanbanColumnStatus) => void;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-white/10 bg-surface-raised p-3 shadow-sm">
      <div className="min-w-0">
        <Link
          href={`/admin/bookings/${booking.id}`}
          className="block font-medium text-white hover:underline"
        >
          {booking.customer_name}
        </Link>
        <p className="mt-0.5 font-mono text-xs text-white/40">
          {booking.confirmation_code}
        </p>
        <p className="mt-1 text-xs text-white/50">
          {formatBookingDateRange(booking.booking_date, booking.end_date)}
        </p>
      </div>
      <Select
        value={booking.status}
        onValueChange={(value) =>
          onStatusChange(booking.id, value as KanbanColumnStatus)
        }
        disabled={isPending}
      >
        <SelectTrigger className="h-8 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {COLUMNS.map((status) => (
            <SelectItem key={status} value={status}>
              {BOOKING_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function KanbanColumn({
  status,
  bookings,
  pendingId,
  isPending,
  onStatusChange,
}: {
  status: KanbanColumnStatus;
  bookings: KanbanBooking[];
  pendingId: string | null;
  isPending: boolean;
  onStatusChange: (bookingId: string, status: KanbanColumnStatus) => void;
}) {
  return (
    <div
      className={`flex h-[calc(100vh-12rem)] w-72 shrink-0 flex-col rounded-xl border ${COLUMN_COLORS[status]}`}
    >
      <div className="shrink-0 border-b border-white/10 px-4 py-3">
        <h3 className="font-semibold text-white">
          {BOOKING_STATUS_LABELS[status]}
        </h3>
        <p className="text-xs text-white/50">
          {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
        {bookings.map((booking) => (
          <KanbanBookingCard
            key={booking.id}
            booking={booking}
            isPending={isPending && pendingId === booking.id}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
}

export function BookingsKanban({
  initialBookings,
}: {
  initialBookings: KanbanBooking[];
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);

  function handleStatusChange(bookingId: string, newStatus: KanbanColumnStatus) {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking || booking.status === newStatus) return;

    const previousStatus = booking.status;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: newStatus } : b,
      ),
    );
    setPendingId(bookingId);

    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, newStatus);
      setPendingId(null);
      if (result.success) {
        toast.success(result.message);
      } else {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: previousStatus } : b,
          ),
        );
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          bookings={getBookingsByStatus(bookings, status)}
          pendingId={pendingId}
          isPending={isPending}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
}

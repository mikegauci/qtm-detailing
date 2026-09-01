"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import { updateBookingStatus } from "@/app/actions/admin/bookings";
import type { Enums, Tables } from "@/lib/supabase/types";
import { BOOKING_STATUS_LABELS } from "@/lib/utils/booking";

type BookingStatus = Enums<"booking_status">;

type KanbanBooking = {
  id: string;
  confirmation_code: string;
  booking_date: string;
  start_time: string;
  customer_name: string;
  status: BookingStatus;
};

const COLUMNS: BookingStatus[] = [
  "booked",
  "in_progress",
  "completed",
  "paid",
  "cancelled",
];

const COLUMN_COLORS: Record<BookingStatus, string> = {
  booked: "border-blue-500/30 bg-blue-500/5",
  in_progress: "border-amber-500/30 bg-amber-500/5",
  completed: "border-emerald-500/30 bg-emerald-500/5",
  paid: "border-purple-500/30 bg-purple-500/5",
  cancelled: "border-red-500/30 bg-red-500/5",
};

function BookingCard({
  booking,
  isDragging,
}: {
  booking: KanbanBooking;
  isDragging?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: booking.id, data: { status: booking.status } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-white/10 bg-surface-raised p-3 shadow-sm"
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 cursor-grab text-white/30 hover:text-white/60 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
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
            {booking.booking_date} · {booking.start_time.slice(0, 5)}
          </p>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  status,
  bookings,
}: {
  status: BookingStatus;
  bookings: KanbanBooking[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[400px] w-72 shrink-0 flex-col rounded-xl border transition-colors ${COLUMN_COLORS[status]} ${isOver ? "ring-2 ring-brand-purple-500/50" : ""}`}
    >
      <div className="border-b border-white/10 px-4 py-3">
        <h3 className="font-semibold text-white">
          {BOOKING_STATUS_LABELS[status]}
        </h3>
        <p className="text-xs text-white/50">{bookings.length} booking{bookings.length !== 1 ? "s" : ""}</p>
      </div>
      <SortableContext
        items={bookings.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-1 flex-col gap-2 p-3">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export function BookingsKanban({
  initialBookings,
}: {
  initialBookings: KanbanBooking[];
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const activeBooking = activeId
    ? bookings.find((b) => b.id === activeId)
    : null;

  function getBookingsByStatus(status: BookingStatus) {
    return bookings.filter((b) => b.status === status);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const bookingId = active.id as string;
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    let newStatus: BookingStatus | null = null;

    if (COLUMNS.includes(over.id as BookingStatus)) {
      newStatus = over.id as BookingStatus;
    } else {
      const overBooking = bookings.find((b) => b.id === over.id);
      if (overBooking) newStatus = overBooking.status;
    }

    if (!newStatus || newStatus === booking.status) return;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: newStatus! } : b,
      ),
    );

    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, newStatus!);
      if (result.success) {
        toast.success(result.message);
      } else {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: booking.status } : b,
          ),
        );
        toast.error(result.message);
      }
    });
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            bookings={getBookingsByStatus(status)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeBooking ? (
          <BookingCard booking={activeBooking} isDragging />
        ) : null}
      </DragOverlay>

      {isPending && (
        <p className="text-center text-xs text-white/40">Updating status...</p>
      )}
    </DndContext>
  );
}

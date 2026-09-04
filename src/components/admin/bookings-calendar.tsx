"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import Link from "next/link";

const FullCalendar = dynamic(
  () => import("@fullcalendar/react").then((mod) => mod.default),
  { ssr: false },
);

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
};

const STATUS_COLORS: Record<string, string> = {
  booked: "#3b82f6",
  in_progress: "#f59e0b",
  completed: "#10b981",
  paid: "#a855f7",
  cancelled: "#ef4444",
};

const LEGEND_STATUSES = ["booked", "in_progress", "cancelled"] as const;

export function BookingsCalendar({
  events,
}: {
  events: CalendarEvent[];
}) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      const event = events.find((e) => e.id === info.event.id);
      if (event) setSelectedEvent(event);
    },
    [events],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-xs">
        {LEGEND_STATUSES.map((status) => (
          <span key={status} className="flex items-center gap-1.5 text-white/60">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[status] }}
            />
            {status.replace("_", " ")}
          </span>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-surface-raised p-4 [&_.fc]:text-white [&_.fc-button]:border-white/20 [&_.fc-button]:bg-white/10 [&_.fc-button]:text-white [&_.fc-button-active]:bg-brand-purple-600/30 [&_.fc-col-header-cell]:border-white/10 [&_.fc-daygrid-day]:border-white/10 [&_.fc-scrollgrid]:border-white/10 [&_.fc-timegrid-axis]:border-white/10 [&_.fc-timegrid-slot]:border-white/5">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          eventClick={handleEventClick}
          slotMinTime="07:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          height="auto"
          nowIndicator
        />
      </div>

      {selectedEvent && (
        <div className="rounded-xl border border-white/10 bg-surface-raised p-4">
          <p className="font-medium text-white">{selectedEvent.title}</p>
          <p className="mt-1 text-sm text-white/60">
            {new Date(selectedEvent.start).toLocaleString()} –{" "}
            {new Date(selectedEvent.end).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <Link
            href={`/admin/bookings/${selectedEvent.id}`}
            className="mt-2 inline-block text-sm text-brand-purple-400 hover:underline"
          >
            View booking details →
          </Link>
        </div>
      )}
    </div>
  );
}

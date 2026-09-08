"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventContentArg } from "@fullcalendar/core";
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
  dateLabel: string;
  serviceLabel: string | null;
  vehicleLabel: string | null;
  backgroundColor: string;
  borderColor: string;
};

function CalendarEventContent({ arg }: { arg: EventContentArg }) {
  const serviceLabel = arg.event.extendedProps.serviceLabel as
    | string
    | null
    | undefined;
  const vehicleLabel = arg.event.extendedProps.vehicleLabel as
    | string
    | null
    | undefined;

  return (
    <div className="overflow-hidden px-1 py-0.5 leading-tight">
      <p className="truncate text-[11px] font-medium sm:text-xs">
        {arg.event.title}
      </p>
      {serviceLabel && (
        <p className="truncate text-[10px] opacity-90 sm:text-[11px]">
          {serviceLabel}
        </p>
      )}
      {vehicleLabel && (
        <p className="truncate text-[10px] opacity-75 sm:text-[11px]">
          {vehicleLabel}
        </p>
      )}
    </div>
  );
}

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

  const renderEventContent = useCallback(
    (arg: EventContentArg) => <CalendarEventContent arg={arg} />,
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
        {LEGEND_STATUSES.map((status) => (
          <span key={status} className="flex items-center gap-1.5 text-white/60">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[status] }}
            />
            {status.replace("_", " ")}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-surface-raised p-2 sm:p-4 [&_.fc]:min-w-[320px] [&_.fc]:text-white [&_.fc-button]:border-white/20 [&_.fc-button]:bg-white/10 [&_.fc-button]:px-2 [&_.fc-button]:py-1 [&_.fc-button]:text-xs [&_.fc-button]:text-white [&_.fc-button-active]:bg-brand-purple-600/30 [&_.fc-col-header-cell]:border-white/10 [&_.fc-daygrid-day]:border-white/10 [&_.fc-daygrid-day-number]:text-xs [&_.fc-daygrid-day-number]:sm:text-sm [&_.fc-daygrid-event]:mx-0.5 [&_.fc-daygrid-event]:mb-0.5 [&_.fc-event-main]:overflow-hidden [&_.fc-header-toolbar]:flex-wrap [&_.fc-header-toolbar]:gap-2 [&_.fc-scrollgrid]:border-white/10 [&_.fc-toolbar-chunk]:flex [&_.fc-toolbar-chunk]:flex-wrap [&_.fc-toolbar-chunk]:gap-1 [&_.fc-toolbar-title]:text-base [&_.fc-toolbar-title]:sm:text-xl">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek",
          }}
          events={events}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          dayMaxEvents={3}
          moreLinkClick="popover"
          height="auto"
          nowIndicator
        />
      </div>

      {selectedEvent && (
        <div className="rounded-xl border border-white/10 bg-surface-raised p-4">
          <p className="font-medium text-white">{selectedEvent.title}</p>
          {selectedEvent.serviceLabel && (
            <p className="mt-1 text-sm text-white/70">
              {selectedEvent.serviceLabel}
            </p>
          )}
          {selectedEvent.vehicleLabel && (
            <p className="mt-0.5 text-sm text-white/60">
              {selectedEvent.vehicleLabel}
            </p>
          )}
          <p className="mt-1 text-sm text-white/60">{selectedEvent.dateLabel}</p>
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

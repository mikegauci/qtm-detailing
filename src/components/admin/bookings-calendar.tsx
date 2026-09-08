"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventContentArg } from "@fullcalendar/core";
import Link from "next/link";
import "@fullcalendar/core/index.css";
import "@fullcalendar/daygrid/index.css";

const FullCalendar = dynamic(
  () => import("@fullcalendar/react").then((mod) => mod.default),
  { ssr: false },
);

export type CalendarEvent = {
  id: string;
  title: string;
  customerName: string;
  servicesLabel: string;
  vehicleLabel: string;
  start: string;
  end: string;
  dateLabel: string;
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

function CalendarEventContent({ event }: { event: CalendarEvent }) {
  return (
    <div className="overflow-hidden px-1 py-0.5 leading-tight">
      <p className="truncate text-[11px] font-semibold sm:text-xs">
        {event.customerName}
      </p>
      <p className="truncate text-[10px] opacity-90 sm:text-[11px]">
        {event.servicesLabel}
      </p>
      <p className="truncate text-[10px] opacity-75 sm:text-[11px]">
        {event.vehicleLabel}
      </p>
    </div>
  );
}

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
      const event = events.find((entry) => entry.id === info.event.id);
      if (event) setSelectedEvent(event);
    },
    [events],
  );

  const renderEventContent = useCallback(
    (info: EventContentArg) => {
      const event = events.find((entry) => entry.id === info.event.id);
      if (!event) return null;
      return <CalendarEventContent event={event} />;
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

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[320px] rounded-xl border border-white/10 bg-surface-raised p-3 sm:p-4 [&_.fc]:text-white [&_.fc-button]:border-white/20 [&_.fc-button]:bg-white/10 [&_.fc-button]:px-2 [&_.fc-button]:py-1 [&_.fc-button]:text-xs [&_.fc-button]:text-white sm:[&_.fc-button]:px-3 sm:[&_.fc-button]:text-sm [&_.fc-button-active]:bg-brand-purple-600/30 [&_.fc-col-header-cell]:border-white/10 [&_.fc-col-header-cell]:bg-transparent [&_.fc-col-header-cell-cushion]:px-1 [&_.fc-col-header-cell-cushion]:py-2 [&_.fc-col-header-cell-cushion]:text-[11px] [&_.fc-col-header-cell-cushion]:font-medium [&_.fc-col-header-cell-cushion]:text-white/70 sm:[&_.fc-col-header-cell-cushion]:text-xs [&_.fc-daygrid-day]:border-white/10 [&_.fc-daygrid-day-number]:px-1 [&_.fc-daygrid-day-number]:py-1 [&_.fc-daygrid-day-number]:text-xs [&_.fc-daygrid-day-number]:text-white/70 sm:[&_.fc-daygrid-day-number]:text-sm [&_.fc-daygrid-event]:mx-0.5 [&_.fc-daygrid-event]:rounded-md [&_.fc-event]:border-0 [&_.fc-event-main]:overflow-hidden [&_.fc-scrollgrid]:border-white/10 [&_.fc-toolbar]:gap-2 [&_.fc-toolbar-chunk]:flex [&_.fc-toolbar-chunk]:flex-wrap [&_.fc-toolbar-chunk]:items-center [&_.fc-toolbar-chunk]:gap-1 [&_.fc-toolbar-title]:text-base [&_.fc-toolbar-title]:font-semibold sm:[&_.fc-toolbar-title]:text-xl max-sm:[&_.fc-header-toolbar]:flex-col max-sm:[&_.fc-header-toolbar]:items-stretch max-sm:[&_.fc-toolbar-chunk]:justify-center">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek",
            }}
            events={events}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            height="auto"
            nowIndicator
            dayMaxEvents={3}
            moreLinkClick="popover"
          />
        </div>
      </div>

      {selectedEvent && (
        <div className="rounded-xl border border-white/10 bg-surface-raised p-4">
          <p className="font-medium text-white">{selectedEvent.customerName}</p>
          <p className="mt-1 text-sm text-white/70">
            {selectedEvent.servicesLabel}
          </p>
          <p className="text-sm text-white/60">{selectedEvent.vehicleLabel}</p>
          <p className="mt-2 text-sm text-white/60">{selectedEvent.dateLabel}</p>
          <Link
            href={`/admin/bookings/${selectedEvent.id}`}
            className="mt-3 inline-block text-sm text-brand-purple-400 hover:underline"
          >
            View booking details →
          </Link>
        </div>
      )}
    </div>
  );
}

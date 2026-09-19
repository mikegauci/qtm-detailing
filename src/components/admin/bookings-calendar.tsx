"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfWeek,
  subWeeks,
} from "date-fns";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventContentArg } from "@fullcalendar/core";
import { useRouter } from "next/navigation";
import {
  CALENDAR_LEGEND_STATUSES,
  CALENDAR_STATUS_COLORS,
} from "@/lib/utils/booking";
import { parseDateKey } from "@/lib/utils/dates";

const FullCalendar = dynamic(
  () => import("@fullcalendar/react").then((mod) => mod.default),
  { ssr: false },
);

const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  dateLabel: string;
  serviceLabel: string | null;
  vehicleLabel: string | null;
  priceLabel: string | null;
  notes: string | null;
  backgroundColor: string;
  borderColor: string;
};

type CalendarEventBodyProps = {
  title: string;
  serviceLabel?: string | null;
  vehicleLabel?: string | null;
  priceLabel?: string | null;
  notes?: string | null;
  compact?: boolean;
};

function CalendarEventBody({
  title,
  serviceLabel,
  vehicleLabel,
  priceLabel,
  notes,
  compact = false,
}: CalendarEventBodyProps) {
  const titleClass = compact
    ? "truncate text-[11px] font-medium sm:text-xs"
    : "truncate text-sm font-medium";
  const detailClass = compact
    ? "truncate text-[10px] sm:text-[11px]"
    : "truncate text-xs";

  return (
    <div className="min-w-0 flex-1 overflow-hidden leading-tight text-white">
      <p className={titleClass}>{title}</p>
      {serviceLabel && (
        <p className={`${detailClass} text-white/90`}>{serviceLabel}</p>
      )}
      {vehicleLabel && (
        <p className={`${detailClass} text-white/80`}>{vehicleLabel}</p>
      )}
      {priceLabel && (
        <p className={`${detailClass} font-medium text-white/90`}>
          {priceLabel}
        </p>
      )}
      {notes && (
        <p
          className={`${detailClass} italic text-white/75`}
          title={notes}
        >
          {notes}
        </p>
      )}
    </div>
  );
}

function CalendarEventContent({ arg }: { arg: EventContentArg }) {
  return (
    <div className="overflow-hidden px-1 py-0.5">
      <CalendarEventBody
        compact
        title={arg.event.title}
        serviceLabel={arg.event.extendedProps.serviceLabel as string | null}
        vehicleLabel={arg.event.extendedProps.vehicleLabel as string | null}
        priceLabel={arg.event.extendedProps.priceLabel as string | null}
        notes={arg.event.extendedProps.notes as string | null}
      />
    </div>
  );
}

function isEventOnDay(event: CalendarEvent, dayKey: string) {
  return dayKey >= event.start && dayKey < event.end;
}

type MobileCalendarView = "week" | "month";

function CalendarViewToggle({
  view,
  onViewChange,
}: {
  view: MobileCalendarView;
  onViewChange: (view: MobileCalendarView) => void;
}) {
  const buttonClass = (active: boolean) =>
    active
      ? "border-brand-purple-600/40 bg-brand-purple-600/30 text-white"
      : "border-white/20 bg-white/10 text-white hover:bg-white/15";

  return (
    <div className="flex">
      <button
        type="button"
        aria-pressed={view === "month"}
        onClick={() => onViewChange("month")}
        className={`rounded-l border px-2.5 py-1 text-xs ${buttonClass(view === "month")}`}
      >
        month
      </button>
      <button
        type="button"
        aria-pressed={view === "week"}
        onClick={() => onViewChange("week")}
        className={`-ml-px rounded-r border px-2.5 py-1 text-xs ${buttonClass(view === "week")}`}
      >
        week
      </button>
    </div>
  );
}

function MobileWeekCalendar({
  events,
  today,
  weekStart,
  onWeekStartChange,
}: {
  events: CalendarEvent[];
  today: string;
  weekStart: Date;
  onWeekStartChange: (weekStart: Date) => void;
}) {
  const router = useRouter();

  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, { weekStartsOn: 0 }),
  });

  const rangeLabel = `${format(weekDays[0], "MMM d")} – ${format(weekDays[6], "d, yyyy")}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => onWeekStartChange(subWeeks(weekStart, 1))}
            className="rounded border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white hover:bg-white/15"
            aria-label="Previous week"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => onWeekStartChange(addWeeks(weekStart, 1))}
            className="rounded border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white hover:bg-white/15"
            aria-label="Next week"
          >
            ›
          </button>
          <button
            type="button"
            onClick={() =>
              onWeekStartChange(
                startOfWeek(parseDateKey(today), { weekStartsOn: 0 }),
              )
            }
            className="rounded border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white hover:bg-white/15"
            aria-label="Go to current week"
          >
            today
          </button>
        </div>
        <h2 className="text-base font-semibold text-white">{rangeLabel}</h2>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10">
        {weekDays.map((day) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const dayEvents = events.filter((event) => isEventOnDay(event, dayKey));
          const isToday = dayKey === today;

          return (
            <section
              key={dayKey}
              className={isToday ? "bg-brand-purple-600/10" : "bg-transparent"}
            >
              <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-3 py-2">
                <span className="font-medium text-white">
                  {format(day, "EEEE")}
                </span>
                <span className="text-sm text-white/60">
                  {format(day, "MMM d")}
                </span>
              </div>

              {dayEvents.length === 0 ? (
                <p className="border-b border-white/10 px-3 py-3 text-sm text-white/40 last:border-b-0">
                  No bookings
                </p>
              ) : (
                <div className="divide-y divide-white/10 border-b border-white/10 last:border-b-0">
                  {dayEvents.map((event) => (
                    <button
                      key={`${dayKey}-${event.id}`}
                      type="button"
                      onClick={() => router.push(`/admin/bookings/${event.id}`)}
                      className="flex w-full cursor-pointer gap-3 px-3 py-2.5 text-left hover:bg-white/5"
                    >
                      <span
                        className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: event.backgroundColor }}
                      />
                      <CalendarEventBody
                        title={event.title}
                        serviceLabel={event.serviceLabel}
                        vehicleLabel={event.vehicleLabel}
                        priceLabel={event.priceLabel}
                        notes={event.notes}
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia(MOBILE_MEDIA_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function useIsMobileCalendar() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_MEDIA_QUERY).matches,
    () => false,
  );
}

function MobileCalendar({
  events,
  today,
  initialWeekStart,
  onEventClick,
  renderEventContent,
}: {
  events: CalendarEvent[];
  today: string;
  initialWeekStart: string;
  onEventClick: (info: EventClickArg) => void;
  renderEventContent: (arg: EventContentArg) => ReactNode;
}) {
  const [view, setView] = useState<MobileCalendarView>("week");
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(parseDateKey(initialWeekStart), { weekStartsOn: 0 }),
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CalendarViewToggle view={view} onViewChange={setView} />
      </div>

      {view === "week" ? (
        <MobileWeekCalendar
          events={events}
          today={today}
          weekStart={weekStart}
          onWeekStartChange={setWeekStart}
        />
      ) : (
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          firstDay={0}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          events={events}
          eventContent={renderEventContent}
          eventClick={onEventClick}
          dayMaxEvents={2}
          moreLinkClick="popover"
          height="auto"
          nowIndicator
        />
      )}
    </div>
  );
}

function CalendarSkeleton() {
  return <div className="min-h-[420px] animate-pulse rounded-lg bg-white/5" />;
}

export function BookingsCalendar({
  events,
  today,
  initialWeekStart,
}: {
  events: CalendarEvent[];
  today: string;
  initialWeekStart: string;
}) {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const isMobile = useIsMobileCalendar();

  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      info.jsEvent.preventDefault();
      router.push(`/admin/bookings/${info.event.id}`);
    },
    [router],
  );

  const renderEventContent = useCallback(
    (arg: EventContentArg) => <CalendarEventContent arg={arg} />,
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
        {CALENDAR_LEGEND_STATUSES.map((status) => (
          <span key={status} className="flex items-center gap-1.5 text-white/60">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: CALENDAR_STATUS_COLORS[status] }}
            />
            {status.replace("_", " ")}
          </span>
        ))}
      </div>

      <div className="bookings-calendar overflow-x-auto rounded-xl border border-white/10 bg-surface-raised p-2 sm:p-4 max-md:overflow-x-visible [&_.fc]:min-w-0 [&_.fc]:text-white md:[&_.fc]:min-w-[320px] [&_.fc-button]:px-2 [&_.fc-button]:py-1 [&_.fc-button]:text-xs [&_.fc-col-header-cell-cushion]:font-medium [&_.fc-col-header-cell-cushion]:text-white/70 [&_.fc-col-header-cell]:border-white/10 [&_.fc-day-other_.fc-daygrid-day-number]:text-white/30 [&_.fc-daygrid-day-number]:text-xs [&_.fc-daygrid-day-number]:font-medium [&_.fc-daygrid-day-number]:text-white/70 [&_.fc-daygrid-day-number]:no-underline [&_.fc-daygrid-day-number]:hover:text-white [&_.fc-daygrid-day-number]:sm:text-sm [&_.fc-daygrid-day]:border-white/10 [&_.fc-daygrid-event]:mx-0.5 [&_.fc-daygrid-event]:mb-0.5 [&_.fc-daygrid-event]:cursor-pointer [&_.fc-daygrid-more-link]:text-white/70 [&_.fc-daygrid-more-link]:hover:bg-white/10 [&_.fc-daygrid-more-link]:hover:text-white [&_.fc-event-main]:overflow-hidden [&_.fc-header-toolbar]:flex-wrap [&_.fc-header-toolbar]:gap-2 [&_.fc-popover]:border-white/10 [&_.fc-popover]:bg-surface-elevated [&_.fc-popover-header]:bg-surface-raised [&_.fc-popover-header]:text-white [&_.fc-scrollgrid]:border-white/10 [&_.fc-toolbar-chunk]:flex [&_.fc-toolbar-chunk]:flex-wrap [&_.fc-toolbar-chunk]:gap-1 [&_.fc-toolbar-title]:text-base [&_.fc-toolbar-title]:sm:text-xl">
        {!hasMounted ? (
          <CalendarSkeleton />
        ) : isMobile ? (
          <MobileCalendar
            events={events}
            today={today}
            initialWeekStart={initialWeekStart}
            onEventClick={handleEventClick}
            renderEventContent={renderEventContent}
          />
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            firstDay={0}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek",
            }}
            views={{
              dayGridWeek: {
                buttonText: "week",
              },
            }}
            events={events}
            eventContent={renderEventContent}
            eventClick={handleEventClick}
            dayMaxEvents={3}
            moreLinkClick="popover"
            height="auto"
            nowIndicator
          />
        )}
      </div>
    </div>
  );
}

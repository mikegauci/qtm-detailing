"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const BookingsKanban = dynamic(
  () =>
    import("@/components/admin/bookings-kanban").then(
      (mod) => mod.BookingsKanban,
    ),
  {
    loading: () => (
      <div className="rounded-xl border border-white/10 p-8 text-center text-sm text-white/60">
        Loading kanban board…
      </div>
    ),
  },
);

export function BookingsKanbanLazy(
  props: ComponentProps<typeof BookingsKanban>,
) {
  return <BookingsKanban {...props} />;
}

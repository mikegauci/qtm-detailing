"use client";

import { createLazyComponent } from "@/lib/lazy/create-lazy-component";
import type { BookingsKanban } from "@/components/admin/bookings-kanban";

export const BookingsKanbanLazy = createLazyComponent<
  React.ComponentProps<typeof BookingsKanban>
>(
  () => import("@/components/admin/bookings-kanban"),
  "BookingsKanban",
  "kanban board",
);

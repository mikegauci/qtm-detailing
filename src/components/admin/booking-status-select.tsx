"use client";

import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
} from "@/lib/utils/booking";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = Object.keys(BOOKING_STATUS_LABELS);

type BookingStatusSelectProps = {
  value: string;
  onValueChange: (status: string) => void;
  disabled?: boolean;
  className?: string;
};

export function BookingStatusSelect({
  value,
  onValueChange,
  disabled,
  className,
}: BookingStatusSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          "w-full border font-medium sm:w-44",
          BOOKING_STATUS_COLORS[value],
          className,
        )}
      >
        <SelectValue>{BOOKING_STATUS_LABELS[value]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((status) => (
          <SelectItem
            key={status}
            value={status}
            className={cn(
              "my-0.5 rounded-md border font-medium focus:text-inherit",
              BOOKING_STATUS_COLORS[status],
            )}
          >
            {BOOKING_STATUS_LABELS[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

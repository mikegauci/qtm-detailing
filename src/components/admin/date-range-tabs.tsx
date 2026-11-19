import Link from "next/link";
import { DATE_RANGES, DATE_RANGE_LABELS, type DateRange } from "@/lib/admin/date-range";

export function DateRangeTabs({ range, basePath }: { range: DateRange; basePath: string }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-white/10 p-1 text-sm">
      {DATE_RANGES.map((key) => (
        <Link
          key={key}
          href={key === "this_month" ? basePath : `${basePath}?range=${key}`}
          className={`rounded-md px-3 py-1 ${
            key === range
              ? "bg-brand-purple-500/30 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          {DATE_RANGE_LABELS[key]}
        </Link>
      ))}
    </div>
  );
}

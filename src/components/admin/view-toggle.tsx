"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ViewToggleOption<T extends string> = {
  id: T;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
};

type ViewToggleProps<T extends string> = {
  value: T;
  options: ViewToggleOption<T>[];
  onChange: (value: T) => void;
  className?: string;
};

export function ViewToggle<T extends string>({
  value,
  options,
  onChange,
  className,
}: ViewToggleProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex w-full rounded-xl border border-white/10 bg-black/20 p-1 sm:w-auto",
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:flex-none",
            value === option.id
              ? "bg-brand-purple-600 text-white"
              : "text-white/70 hover:text-white",
          )}
        >
          {option.icon}
          {option.label}
          {option.badge}
        </button>
      ))}
    </div>
  );
}

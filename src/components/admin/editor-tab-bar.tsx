"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EditorTab<T extends string> = {
  id: T;
  label: string;
  icon?: ReactNode;
};

type EditorTabBarProps<T extends string> = {
  value: T;
  tabs: EditorTab<T>[];
  onChange: (value: T) => void;
};

export function EditorTabBar<T extends string>({
  value,
  tabs,
  onChange,
}: EditorTabBarProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-brand-purple-500/50 bg-brand-purple-500/15 text-white"
                : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:text-white",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

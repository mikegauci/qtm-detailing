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
  variant?: "page" | "section";
};

export function EditorTabBar<T extends string>({
  value,
  tabs,
  onChange,
  variant = "section",
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
              "inline-flex items-center gap-2 rounded-lg border font-medium transition-colors",
              variant === "page"
                ? "px-4 py-2.5 text-sm"
                : "px-3 py-2 text-xs",
              isActive
                ? variant === "page"
                  ? "border-brand-purple-500/50 bg-brand-purple-500/15 text-white"
                  : "border-white/20 bg-white/[0.06] text-white"
                : variant === "page"
                  ? "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:text-white"
                  : "border-white/5 bg-transparent text-white/50 hover:border-white/15 hover:text-white/80",
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

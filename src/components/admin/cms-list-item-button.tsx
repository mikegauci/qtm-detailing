"use client";

import type { ReactNode } from "react";

type CmsListItemButtonProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  onClick: () => void;
};

export function CmsListItemButton({
  title,
  subtitle,
  badge,
  onClick,
}: CmsListItemButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-white/10 p-3 text-left hover:bg-white/5"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">{title}</p>
        {badge}
      </div>
      {subtitle ? (
        <p className="mt-1 line-clamp-2 text-sm text-white/60">{subtitle}</p>
      ) : null}
    </button>
  );
}

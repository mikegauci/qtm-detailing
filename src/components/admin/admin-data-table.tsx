"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type AdminDataTableProps = {
  children: ReactNode;
  emptyMessage?: ReactNode;
  isEmpty?: boolean;
  className?: string;
};

export function AdminDataTable({
  children,
  emptyMessage,
  isEmpty = false,
  className,
}: AdminDataTableProps) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-white/10",
        className,
      )}
    >
      <table className="w-full text-sm">{children}</table>
      {isEmpty && emptyMessage ? (
        <p className="px-4 py-12 text-center text-sm text-white/50">
          {emptyMessage}
        </p>
      ) : null}
    </div>
  );
}

export function AdminTableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-white/10 bg-white/5 text-left text-white/60">
        {children}
      </tr>
    </thead>
  );
}

export function AdminTableHeaderCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th className={cn("px-4 py-3 font-medium", className)}>{children}</th>
  );
}

export function AdminTableRow({
  children,
  className,
  href,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  const router = useRouter();

  function handleNavigate() {
    if (href) router.push(href);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTableRowElement>) {
    if (!href) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      router.push(href);
    }
  }

  return (
    <tr
      className={cn(
        "border-b border-white/5",
        href &&
          "cursor-pointer hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline-none",
        className,
      )}
      onClick={href ? handleNavigate : undefined}
      onKeyDown={href ? handleKeyDown : undefined}
      tabIndex={href ? 0 : undefined}
      role={href ? "link" : undefined}
    >
      {children}
    </tr>
  );
}

export function AdminTableCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-3", className)}>{children}</td>;
}

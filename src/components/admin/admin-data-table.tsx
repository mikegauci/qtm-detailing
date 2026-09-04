import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminDataTableProps = {
  children: ReactNode;
  emptyMessage?: string;
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
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={cn("border-b border-white/5 hover:bg-white/5", className)}
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

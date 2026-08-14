import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20",
  approved:  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
  active:    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
  confirmed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
  paid:      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
  completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
  rejected:  "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20",
  suspended: "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20",
  refunded:  "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 ring-zinc-500/20",
  admin:     "bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-violet-500/20",
  host:      "bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-sky-500/20",
  traveler:  "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 ring-zinc-500/20",
};

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  const key = String(children).toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset",
        STATUS_STYLES[key] ?? "bg-fd-secondary text-fd-secondary-foreground ring-fd-border",
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-fd-border bg-fd-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-fd-muted-foreground">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-fd-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-fd-border bg-fd-card", className)}>{children}</div>;
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h1 className="text-xl font-semibold">{title}</h1>
      {description && <p className="mt-1 text-sm text-fd-muted-foreground">{description}</p>}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="px-4 py-12 text-center text-sm text-fd-muted-foreground">{children}</div>;
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={cn("px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-fd-muted-foreground", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-middle text-sm", className)}>{children}</td>;
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-fd-border">
      <table className="w-full border-collapse text-fd-foreground">{children}</table>
    </div>
  );
}

export function Money({ amount, currency = "EUR" }: { amount: number; currency?: string }) {
  return (
    <span className="tabular-nums">
      {new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(amount)}
    </span>
  );
}

export function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-IE", { year: "numeric", month: "short", day: "numeric" });
}

export function fmtDateTime(d: Date | string) {
  return new Date(d).toLocaleString("en-IE", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

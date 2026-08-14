"use client";

import { useState, useTransition, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { ActionResult } from "../actions";

const VARIANTS: Record<string, string> = {
  primary: "bg-fd-primary text-fd-primary-foreground hover:opacity-90",
  secondary: "bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent",
  danger: "bg-red-600 text-white hover:bg-red-500",
  ghost: "text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground",
};

export function ActionButton({
  action,
  children,
  variant = "secondary",
  confirm,
  className,
}: {
  action: () => Promise<ActionResult>;
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  confirm?: string;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (confirm && !window.confirm(confirm)) return;
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
          VARIANTS[variant],
          className
        )}
      >
        {isPending ? "Working…" : children}
      </button>
      {error && <span className="text-xs text-fd-error">{error}</span>}
    </span>
  );
}

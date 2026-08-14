"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import type { ActionResult } from "../actions";

export function ActionSelect({
  value,
  options,
  action,
  className,
}: {
  value: string;
  options: { value: string; label: string }[];
  action: (next: string) => Promise<ActionResult>;
  className?: string;
}) {
  const [current, setCurrent] = useState(value);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(next: string) {
    const previous = current;
    setCurrent(next);
    setError(null);
    startTransition(async () => {
      const result = await action(next);
      if (!result.ok) {
        setCurrent(previous);
        setError(result.error);
      }
    });
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <select
        value={current}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value)}
        className={cn(
          "rounded-lg border border-fd-border bg-fd-background px-2 py-1 text-xs font-medium capitalize outline-none ring-fd-ring focus:ring-2 disabled:opacity-50",
          className
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="text-xs text-fd-error">{error}</span>}
    </span>
  );
}

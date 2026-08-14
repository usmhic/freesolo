"use client";

import { useState, useTransition, type ReactNode, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import type { ActionResult } from "../actions";

export interface EditField {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "checkbox";
  options?: { value: string; label: string }[];
  rows?: number;
}

export function EditModal({
  trigger,
  title,
  fields,
  initialValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  fields: EditField[];
  initialValues: Record<string, any>;
  action: (values: any) => Promise<ActionResult>;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function openModal() {
    setValues(initialValues);
    setError(null);
    setOpen(true);
  }

  function setField(name: string, value: unknown) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await action(values);
      if (!result.ok) { setError(result.error); return; }
      setOpen(false);
    });
  }

  return (
    <>
      <span onClick={openModal} className="inline-flex cursor-pointer">{trigger}</span>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-fd-border bg-fd-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold">{title}</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              {fields.map((f) => (
                <div key={f.name}>
                  {f.type !== "checkbox" && (
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
                      {f.label}
                    </label>
                  )}
                  {f.type === "textarea" ? (
                    <textarea
                      value={values[f.name] ?? ""}
                      onChange={(e) => setField(f.name, e.target.value)}
                      rows={f.rows ?? 3}
                      className="w-full rounded-lg border border-fd-border bg-fd-background px-3 py-1.5 text-sm outline-none ring-fd-ring focus:ring-2"
                    />
                  ) : f.type === "select" ? (
                    <select
                      value={values[f.name] ?? ""}
                      onChange={(e) => setField(f.name, e.target.value)}
                      className="w-full rounded-lg border border-fd-border bg-fd-background px-3 py-1.5 text-sm capitalize outline-none ring-fd-ring focus:ring-2"
                    >
                      {(f.options ?? []).map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : f.type === "checkbox" ? (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!values[f.name]}
                        onChange={(e) => setField(f.name, e.target.checked)}
                        className="size-4 rounded border-fd-border"
                      />
                      {f.label}
                    </label>
                  ) : f.type === "number" ? (
                    <input
                      type="number"
                      value={values[f.name] ?? 0}
                      onChange={(e) => setField(f.name, Number(e.target.value) || 0)}
                      className="w-full rounded-lg border border-fd-border bg-fd-background px-3 py-1.5 text-sm outline-none ring-fd-ring focus:ring-2"
                    />
                  ) : (
                    <input
                      type="text"
                      value={values[f.name] ?? ""}
                      onChange={(e) => setField(f.name, e.target.value)}
                      className="w-full rounded-lg border border-fd-border bg-fd-background px-3 py-1.5 text-sm outline-none ring-fd-ring focus:ring-2"
                    />
                  )}
                </div>
              ))}

              {error && <p className="text-xs text-fd-error">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-fd-muted-foreground hover:bg-fd-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className={cn(
                    "rounded-lg bg-fd-primary px-3 py-1.5 text-xs font-medium text-fd-primary-foreground hover:opacity-90 disabled:opacity-50"
                  )}
                >
                  {isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

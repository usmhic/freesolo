"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { createCampaign, type CampaignInput } from "../../../actions";
import { Card } from "../../../_components/ui";

const inputClass =
  "w-full rounded-lg border border-fd-border bg-fd-background px-3 py-1.5 text-sm outline-none ring-fd-ring focus:ring-2";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-fd-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function CampaignForm({
  segments,
}: {
  segments: { value: string; label: string; count: number }[];
}) {
  const empty: CampaignInput = { title: "", subject: "", body: "", segment: "all" };
  const [form, setForm] = useState<CampaignInput>(empty);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await createCampaign(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setForm(empty);
      setSuccess(true);
    });
  }

  const selected = segments.find((s) => s.value === form.segment);

  return (
    <Card className="p-5">
      <h2 className="mb-3 text-sm font-semibold">New campaign</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Internal title">
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Summer launch announcement"
              required
            />
          </Field>
          <Field label="Audience segment">
            <select
              className={inputClass}
              value={form.segment}
              onChange={(e) => setForm((f) => ({ ...f, segment: e.target.value }))}
            >
              {segments.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label} ({s.count})
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Email subject">
          <input
            className={inputClass}
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            placeholder="What recipients will see in their inbox"
            required
          />
        </Field>

        <Field label="Email body">
          <textarea
            className={inputClass}
            rows={6}
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            placeholder="Write your message — separate paragraphs with a blank line."
            required
          />
        </Field>

        {selected && (
          <p className="text-xs text-fd-muted-foreground">
            Will reach ~{selected.count} recipient{selected.count === 1 ? "" : "s"} when sent.
          </p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
        {success && <p className="text-xs text-emerald-500">Draft saved below.</p>}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-fd-primary px-4 py-1.5 text-sm font-medium text-fd-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save as draft"}
        </button>
      </form>
    </Card>
  );
}

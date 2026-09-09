"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Hourglass,
  Loader2,
  Search,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { checkApplicationStatus, type ApplicationStatus, type StatusState } from "../actions";

/** Visual + copy treatment per status the API can return. */
const PRESENTATION = {
  pending: {
    icon: Hourglass,
    label: "In review",
    tone: "text-[#D97706]",
    ring: "bg-[#D97706]/10",
    headline: "Someone's reading it",
    body: "Your application is in the review queue. Most are read within 48 hours — we'll email you the moment there's a decision. Nothing to do on your end.",
  },
  approved: {
    icon: CheckCircle2,
    label: "Approved",
    tone: "text-[#2D7D46]",
    ring: "bg-[#2D7D46]/10",
    headline: "You're in 🎉",
    body: "Welcome to FreeSolo. Check your inbox for an invite code, then open the app and sign in with this email — your profile will carry a verified badge.",
  },
  rejected: {
    icon: XCircle,
    label: "Not this time",
    tone: "text-[#DC2626]",
    ring: "bg-[#DC2626]/10",
    headline: "Not this time",
    body: "FreeSolo is small by design, and this is more often about timing and fit than anything you did. You're genuinely welcome to apply again later.",
  },
} as const;

function fallbackPresentation(status: string) {
  return {
    icon: Hourglass,
    label: status,
    tone: "text-fd-muted-foreground",
    ring: "bg-fd-muted",
    headline: "Application found",
    body: "We found your application. Check your inbox for the latest update.",
  };
}

function formatDate(value: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

function Result({ application }: { application: ApplicationStatus }) {
  const key = application.status?.toLowerCase() as keyof typeof PRESENTATION;
  const p = PRESENTATION[key] ?? fallbackPresentation(application.status);
  const Icon = p.icon;
  const submitted = formatDate(application.submittedAt);
  const reviewed = formatDate(application.reviewedAt);

  return (
    <div className="rounded-2xl border border-fd-border bg-fd-card p-8 text-center">
      <div className={cn("mx-auto flex size-12 items-center justify-center rounded-full", p.ring, p.tone)}>
        <Icon className="size-6" />
      </div>

      <span
        className={cn(
          "mt-4 inline-block rounded-full border border-fd-border px-3 py-1 text-xs font-medium uppercase tracking-wider",
          p.tone
        )}
      >
        {p.label}
      </span>

      <h2 className="mt-3 font-display text-2xl font-semibold">{p.headline}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-fd-muted-foreground">
        {p.body}
      </p>

      <dl className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-px overflow-hidden rounded-xl border border-fd-border bg-fd-border text-left">
        <div className="bg-fd-background p-3">
          <dt className="text-xs text-fd-muted-foreground">Applicant</dt>
          <dd className="mt-0.5 truncate text-sm font-medium">{application.name}</dd>
        </div>
        <div className="bg-fd-background p-3">
          <dt className="text-xs text-fd-muted-foreground">Submitted</dt>
          <dd className="mt-0.5 text-sm font-medium">{submitted ?? "—"}</dd>
        </div>
        <div className="col-span-2 bg-fd-background p-3">
          <dt className="text-xs text-fd-muted-foreground">{reviewed ? "Reviewed" : "Reference"}</dt>
          <dd className="mt-0.5 break-all font-mono text-xs">
            {reviewed ?? application.reference}
          </dd>
        </div>
      </dl>

      {key === "approved" ? (
        <Link
          href="/docs/exploring"
          className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
        >
          Find your first experience <ArrowRight className="size-4" />
        </Link>
      ) : (
        <Link
          href="/docs/joining"
          className="mt-6 inline-flex items-center gap-1.5 text-sm underline underline-offset-2 hover:text-fd-foreground"
        >
          How review works
        </Link>
      )}
    </div>
  );
}

export function StatusForm({ initialReference = "" }: { initialReference?: string }) {
  const [state, formAction, pending] = useActionState<StatusState, FormData>(
    checkApplicationStatus,
    { status: "idle" }
  );

  return (
    <div className="space-y-6">
      <form action={formAction} className="rounded-2xl border border-fd-border bg-fd-card p-6 sm:p-8">
        <label className="block">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Search className="size-3.5 text-[#B8976A]" />
            Application reference
          </span>
          <span className="mt-0.5 block text-xs text-fd-muted-foreground">
            The long code from your confirmation email — or the one shown right after you applied.
          </span>
          <input
            name="reference"
            required
            defaultValue={initialReference}
            placeholder="e.g. 3f9c1b8e-52a7-4c1d-9f0b-2e8a7d4c6b13"
            className="mt-2 w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 font-mono text-sm outline-none transition-colors placeholder:font-sans placeholder:text-fd-muted-foreground focus:border-[#B8976A] focus:ring-2 focus:ring-[#B8976A]/20"
          />
        </label>

        {state.status === "error" ? (
          <p className="mt-4 flex items-start gap-2 rounded-lg border border-[#DC2626]/30 bg-[#DC2626]/5 p-3 text-sm text-[#DC2626]">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-fd-primary px-4 py-2.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Looking it up…
            </>
          ) : (
            <>
              Check status <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>

      {state.status === "found" ? <Result application={state.application} /> : null}
    </div>
  );
}

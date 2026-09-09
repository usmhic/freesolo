"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Loader2,
  Mail,
  PenLine,
  ImageIcon,
  ShieldCheck,
  TriangleAlert,
  User,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { submitApplication, type ApplyState } from "./actions";

const STORY_MIN = 80;

function FieldShell({
  icon: Icon,
  label,
  hint,
  children,
}: {
  icon: typeof User;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-medium">
        <Icon className="size-3.5 text-[#B8976A]" />
        {label}
      </span>
      {hint ? (
        <span className="mt-0.5 block text-xs text-fd-muted-foreground">{hint}</span>
      ) : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-fd-muted-foreground focus:border-[#B8976A] focus:ring-2 focus:ring-[#B8976A]/20";

/** Success panel — the reference is the only way back to the application, so it leads. */
function Submitted({ reference, name }: { reference: string; name: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-2xl border border-fd-border bg-fd-card p-8 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#2D7D46]/10 text-[#2D7D46]">
        <CheckCircle2 className="size-6" />
      </div>
      <h2 className="mt-4 font-display text-2xl font-semibold">
        That&apos;s in, {name.split(" ")[0]}.
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-fd-muted-foreground">
        A real person reads every application — usually within 48 hours. We&apos;ve sent a
        confirmation to your inbox, and we&apos;ll email you either way once it&apos;s been read.
      </p>

      <div className="mx-auto mt-6 max-w-sm rounded-xl border border-dashed border-fd-border bg-fd-background p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-fd-muted-foreground">
          Your reference
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <code className="break-all font-mono text-sm">{reference}</code>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(reference).then(
                () => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                },
                () => setCopied(false)
              );
            }}
            className="shrink-0 rounded-md border border-fd-border p-1.5 transition-colors hover:bg-fd-accent"
            aria-label="Copy reference"
          >
            {copied ? (
              <CheckCircle2 className="size-3.5 text-[#2D7D46]" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-fd-muted-foreground">
          Keep this — it&apos;s how you check your status without signing in.
        </p>
      </div>

      <Link
        href={`/apply/status?reference=${encodeURIComponent(reference)}`}
        className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
      >
        Check status <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

export function ApplyForm() {
  const [state, formAction, pending] = useActionState<ApplyState, FormData>(
    submitApplication,
    { status: "idle" }
  );
  const [story, setStory] = useState("");

  if (state.status === "success") {
    return <Submitted reference={state.reference} name={state.name} />;
  }

  const storyOk = story.trim().length >= STORY_MIN;

  return (
    <form action={formAction} className="rounded-2xl border border-fd-border bg-fd-card p-6 sm:p-8">
      <div className="space-y-5">
        <FieldShell icon={User} label="Your name">
          <input name="name" required placeholder="Amara Okafor" className={inputClass} />
        </FieldShell>

        <FieldShell icon={Mail} label="Email" hint="Where we'll send the decision and your invite code.">
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className={inputClass}
          />
        </FieldShell>

        <FieldShell
          icon={PenLine}
          label="Tell us your story"
          hint="Who you are and how you travel. This is the part reviewers actually read."
        >
          <textarea
            name="story"
            required
            rows={6}
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="I've been travelling solo since a badly-planned trip to Hanoi in 2019 taught me I'm happier finding one good pottery studio than ticking off ten landmarks…"
            className={cn(inputClass, "resize-y leading-relaxed")}
          />
          <div className="mt-1.5 flex items-center justify-between text-xs">
            <span className={cn("font-mono", storyOk ? "text-[#2D7D46]" : "text-fd-muted-foreground")}>
              {story.trim().length} / {STORY_MIN} min
            </span>
            {storyOk ? (
              <span className="flex items-center gap-1 text-[#2D7D46]">
                <CheckCircle2 className="size-3" /> Good to go
              </span>
            ) : null}
          </div>
        </FieldShell>

        <FieldShell
          icon={ImageIcon}
          label="Photo link"
          hint="Optional — a friendly face helps. Becomes your profile picture if you're approved."
        >
          <input
            name="imageUrl"
            type="url"
            placeholder="https://…"
            className={inputClass}
          />
        </FieldShell>
      </div>

      {state.status === "error" ? (
        <p className="mt-5 flex items-start gap-2 rounded-lg border border-[#DC2626]/30 bg-[#DC2626]/5 p-3 text-sm text-[#DC2626]">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-fd-primary px-4 py-2.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            Submit application <ArrowRight className="size-4" />
          </>
        )}
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-fd-muted-foreground">
        <ShieldCheck className="size-3.5" />
        No account or password needed yet.
      </p>
    </form>
  );
}

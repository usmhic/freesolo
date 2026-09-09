import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Eye, Search, Sparkles } from "lucide-react";
import { ApplyForm } from "./_form";

export const metadata: Metadata = {
  title: "Apply to join",
  description:
    "FreeSolo is invite-gated. Tell us how you travel — a real person reads every application, usually within 48 hours.",
};

const WHAT_HAPPENS = [
  {
    icon: Eye,
    title: "A person reads it",
    body: "Not a filter, not a score. Someone on the team reads your story start to finish.",
  },
  {
    icon: Clock,
    title: "Usually within 48 hours",
    body: "You'll hear back either way. No silent rejections, no indefinite waitlist.",
  },
  {
    icon: Sparkles,
    title: "Then you're in",
    body: "Approval flips your account to verified and emails you an invite code. Book or host from day one.",
  },
] as const;

export default function ApplyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="relative overflow-hidden border-b border-fd-border">
        <div
          className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--color-fd-border) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="rounded-full border border-fd-border bg-fd-card px-3 py-1 text-xs font-medium text-fd-muted-foreground">
              ✍️ Applications open
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Tell us how you{" "}
              <span className="bg-gradient-to-r from-fd-primary to-[#B8976A] bg-clip-text italic text-transparent">
                travel
              </span>
            </h1>
            <p className="mt-4 text-balance text-base text-fd-muted-foreground">
              FreeSolo is invite-gated on purpose — it&apos;s what keeps a table of six feeling
              like a table of six. One short application is all it takes.
            </p>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <ApplyForm />

            <aside className="space-y-6 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-fd-border bg-fd-card p-6">
                <h2 className="font-display text-lg font-semibold">What happens next</h2>
                <ul className="mt-4 space-y-4">
                  {WHAT_HAPPENS.map(({ icon: Icon, title, body }) => (
                    <li key={title} className="flex gap-3">
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary">
                        <Icon className="size-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-medium">{title}</span>
                        <span className="mt-0.5 block text-sm text-fd-muted-foreground">
                          {body}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-fd-border bg-fd-card/40 p-6">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <Search className="size-4 text-[#B8976A]" />
                  Already applied?
                </h2>
                <p className="mt-2 text-sm text-fd-muted-foreground">
                  Look your application up with the reference from your confirmation email — no
                  sign-in required.
                </p>
                <Link
                  href="/apply/status"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-fd-border bg-fd-background px-4 py-2 text-sm font-medium transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
                >
                  Check application status
                </Link>
              </div>

              <p className="px-1 text-xs leading-relaxed text-fd-muted-foreground">
                Curious what reviewers see, or what happens if it&apos;s a no? The{" "}
                <Link href="/docs/joining" className="underline underline-offset-2 hover:text-fd-foreground">
                  Help Center walks through the whole flow
                </Link>
                .
              </p>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

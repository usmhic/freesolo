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
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 -z-10 size-[560px] rounded-full bg-sunset/10 blur-3xl"
        />
        <div className="container-page max-w-6xl py-12 sm:py-16">
          <div className="max-w-2xl">
            <p className="eyebrow">Applications open</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Tell us how you <span className="text-sunset">travel</span>
            </h1>
            <p className="mt-4 text-lg text-ink-soft">
              FreeSolo is invite-only on purpose — it&apos;s what keeps a group of strangers feeling like
              a group of friends by day two. One short application is all it takes.
            </p>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <ApplyForm />

            <aside className="space-y-6 lg:sticky lg:top-24">
              <div className="card p-6">
                <h2 className="font-display text-lg font-bold">What happens next</h2>
                <ul className="mt-4 space-y-4">
                  {WHAT_HAPPENS.map(({ icon: Icon, title, body }) => (
                    <li key={title} className="flex gap-3">
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-sunset-soft text-sunset">
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

              <div className="card p-6">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                  <Search className="size-4 text-sunset" />
                  Already applied?
                </h2>
                <p className="mt-2 text-sm text-fd-muted-foreground">
                  Look your application up with the reference from your confirmation email — no
                  sign-in required.
                </p>
                <Link
                  href="/apply/status"
                  className="btn-outline btn-sm mt-4"
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

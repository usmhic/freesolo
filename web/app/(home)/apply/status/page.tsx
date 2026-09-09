import type { Metadata } from "next";
import Link from "next/link";
import { StatusForm } from "./_status-form";

export const metadata: Metadata = {
  title: "Check application status",
  description:
    "Look up a FreeSolo application with the reference from your confirmation email — no sign-in required.",
};

export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;

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
        <div className="mx-auto max-w-xl px-6 py-16 sm:py-20">
          <div className="text-center">
            <span className="rounded-full border border-fd-border bg-fd-card px-3 py-1 text-xs font-medium text-fd-muted-foreground">
              🔎 Application lookup
            </span>
            <h1 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Where&apos;s my application?
            </h1>
            <p className="mt-3 text-balance text-sm text-fd-muted-foreground sm:text-base">
              Paste your reference below. We keep status behind a reference rather than an email
              address so nobody can look up whether someone else applied.
            </p>
          </div>

          <div className="mt-10">
            <StatusForm initialReference={reference ?? ""} />
          </div>

          <p className="mt-8 text-center text-sm text-fd-muted-foreground">
            Lost the reference? It&apos;s in the confirmation email we sent when you applied. Still
            stuck —{" "}
            <Link href="/docs/faq" className="underline underline-offset-2 hover:text-fd-foreground">
              the FAQ can help
            </Link>
            . Haven&apos;t applied yet?{" "}
            <Link href="/apply" className="underline underline-offset-2 hover:text-fd-foreground">
              Start here
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

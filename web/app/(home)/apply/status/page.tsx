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
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 -top-40 -z-10 size-[520px] rounded-full bg-sunset/10 blur-3xl"
        />
        <div className="mx-auto w-full max-w-xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="text-center">
            <p className="eyebrow">Application lookup</p>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Where&apos;s my application?
            </h1>
            <p className="mt-3 text-balance text-ink-soft">
              Paste your reference below. We keep status behind a reference rather than an email
              address so nobody can look up whether someone else applied.
            </p>
          </div>

          <div className="mt-10">
            <StatusForm initialReference={reference ?? ""} />
          </div>

          <p className="mt-8 text-center text-sm text-ink-soft">
            Lost the reference? It&apos;s in the confirmation email we sent when you applied. Still
            stuck —{" "}
            <Link href="/docs/faq" className="font-semibold text-sunset hover:underline">
              the FAQ can help
            </Link>
            . Haven&apos;t applied yet?{" "}
            <Link href="/apply" className="font-semibold text-sunset hover:underline">
              Start here
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

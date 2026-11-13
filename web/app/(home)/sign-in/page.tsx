import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to FreeSolo with a one-time code sent to your email.",
};

/** Only same-site paths are honoured, so `next` can't bounce people off-site. */
function safeNext(next: string | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/planner";
}

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getSession()) redirect(next);

  return (
    <section className="container-page grid flex-1 items-center gap-12 py-12 lg:grid-cols-2 lg:py-20">
      <div className="hidden max-w-md lg:block">
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-3 font-display text-5xl font-extrabold leading-tight tracking-tight">
          Pick up where you left off.
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          Sign in to save routes to your account, open them on any device, and put them on trips you host.
        </p>
      </div>
      <div className="mx-auto w-full max-w-md">
        <SignInForm next={next} />
      </div>
    </section>
  );
}

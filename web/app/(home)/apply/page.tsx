import type { Metadata } from "next";
import { ApplyForm } from "./apply-form";

export const metadata: Metadata = {
  title: "Apply to join — FreeSolo",
  description: "Share one of your solo travel stories to apply for FreeSolo.",
};

export default function ApplyPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 py-16">
      <div className="mb-8 space-y-2 text-center">
        <span className="rounded-full border border-fd-border bg-fd-card px-3 py-1 text-xs font-medium text-fd-muted-foreground">
          Application
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Tell us about your solo journey
        </h1>
        <p className="text-sm text-fd-muted-foreground">
          We review every application personally. Share one real experience — where you went,
          what happened, why it mattered.
        </p>
      </div>

      <ApplyForm />

      <p className="mt-6 text-center text-xs text-fd-muted-foreground">
        Already approved?{" "}
        <a href="/admin/sign-in" className="font-medium text-fd-foreground underline underline-offset-2">
          Sign in
        </a>
      </p>
    </div>
  );
}

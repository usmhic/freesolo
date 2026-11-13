"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Loader2, Mail } from "lucide-react";

const OTP_LENGTH = 6;

export function SignInForm({ next }: { next: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "We couldn't send a code. Try again.");
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "That code didn't work — check it and try again.");
      // The API sets the session cookie on this response.
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="card p-6 shadow-xl shadow-navy/5 sm:p-8">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-sunset-soft text-sunset">
        <Mail className="size-5" />
      </span>
      <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight">
        {step === "email" ? "Sign in to FreeSolo" : "Check your email"}
      </h2>
      <p className="mt-2 text-sm text-ink-soft">
        {step === "email"
          ? "We'll email you a one-time code. No password needed."
          : `We sent a ${OTP_LENGTH}-digit code to ${email}. It expires in 5 minutes.`}
      </p>

      {step === "email" ? (
        <form onSubmit={sendCode} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="field mt-1.5 h-12"
            />
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary h-12 w-full">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <>Email me a code <ArrowRight className="size-4" /></>}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Code</span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={OTP_LENGTH}
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              className="field mt-1.5 h-14 text-center font-display text-2xl tracking-[0.5em]"
            />
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button type="submit" disabled={busy || code.length !== OTP_LENGTH} className="btn-primary h-12 w-full">
            {busy ? <Loader2 className="size-4 animate-spin" /> : "Sign in"}
          </button>
          <button
            type="button"
            onClick={() => { setStep("email"); setCode(""); setError(null); }}
            className="btn-ghost w-full"
          >
            <ArrowLeft className="size-4" /> Use a different email
          </button>
        </form>
      )}

      <p className="mt-6 border-t border-line pt-5 text-center text-sm text-ink-soft">
        Not a member yet?{" "}
        <Link href="/apply" className="font-semibold text-sunset hover:underline">Apply to join</Link>
      </p>
    </div>
  );
}

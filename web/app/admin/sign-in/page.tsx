"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FreeSoloLogo } from "@/components/logo";

const OTP_LENGTH = 6;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.96h5.52c-.24 1.44-1.68 4.2-5.52 4.2-3.32 0-6.04-2.76-6.04-6.16s2.72-6.16 6.04-6.16c1.9 0 3.16.8 3.88 1.5l2.66-2.56C16.94 3.36 14.7 2.4 12 2.4 6.92 2.4 2.8 6.6 2.8 11.6S6.92 20.8 12 20.8c5.36 0 8.64-3.76 8.64-9.04 0-.6-.06-1.06-.14-1.56H12z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
      <path d="M16.36 1.43c0 1.14-.42 2.2-1.13 3.02-.78.9-2.04 1.6-3.18 1.5-.13-1.1.42-2.27 1.13-3.03C13.95 1.97 15.27 1.5 16.36 1.43zM20.6 17.18c-.4.92-.6 1.33-1.12 2.14-.72 1.13-1.74 2.54-3 2.55-1.12.02-1.4-.73-2.92-.72-1.51.01-1.83.74-2.96.72-1.26-.02-2.23-1.28-2.95-2.4-2.02-3.13-2.23-6.8-.99-8.76.88-1.4 2.27-2.22 3.58-2.22 1.33 0 2.17.74 3.27.74 1.07 0 1.72-.74 3.27-.74 1.17 0 2.4.64 3.28 1.74-2.88 1.58-2.41 5.7.54 6.95z"/>
    </svg>
  );
}

export default function AdminSignInPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState<"send" | "verify" | "google" | "apple" | null>(null);

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading("send");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Couldn't send the code. Try again.");
        return;
      }
      setInfo(`We sent a ${OTP_LENGTH}-digit code to ${email}. It expires in 5 minutes.`);
      setStep("otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading("verify");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "That code didn't work — check it and try again.");
        return;
      }
      // Spring Boot sets the freesolo-token HttpOnly cookie in the response.
      // Redirect to admin dashboard.
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function handleSocial(provider: "google" | "apple") {
    setError(null);
    setLoading(provider);
    try {
      const res = await fetch(
        `/api/auth/oauth/${provider}/authorize?redirect_uri=${encodeURIComponent(window.location.origin + "/admin")}`
      );
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(`Couldn't continue with ${provider === "google" ? "Google" : "Apple"}.`);
        setLoading(null);
        return;
      }
      window.location.href = data.url;
      // Browser is redirecting — keep loading state
    } catch {
      setError("Network error. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-fd-background px-4 text-fd-foreground">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <FreeSoloLogo className="mb-3 justify-center" markClassName="size-10 rounded-lg text-sm" textClassName="text-xl" />
          <h1 className="text-lg font-semibold">Sign in to FreeSolo</h1>
          <p className="mt-1 text-sm text-fd-muted-foreground">
            For approved travelers, hosts, businesses, and the FreeSolo team.
          </p>
        </div>

        <div className="space-y-4 rounded-xl border border-fd-border bg-fd-card p-6">
          {step === "email" && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none ring-fd-ring focus:ring-2"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-fd-error/10 px-3 py-2 text-sm text-fd-error">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading === "send"}
                className="w-full rounded-lg bg-fd-primary px-3 py-2 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading === "send" ? "Sending code…" : "Send sign-in code"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerify} className="space-y-4">
              {info && <p className="text-sm text-fd-muted-foreground">{info}</p>}
              <div className="space-y-1.5">
                <label htmlFor="otp" className="text-sm font-medium">{OTP_LENGTH}-digit code</label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={OTP_LENGTH}
                  required
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
                  placeholder="••••••"
                  className="w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-center text-lg tracking-[0.5em] outline-none ring-fd-ring focus:ring-2"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-fd-error/10 px-3 py-2 text-sm text-fd-error">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading === "verify" || otp.length !== OTP_LENGTH}
                className="w-full rounded-lg bg-fd-primary px-3 py-2 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading === "verify" ? "Verifying…" : "Verify and sign in"}
              </button>

              <button
                type="button"
                onClick={() => { setStep("email"); setOtp(""); setError(null); setInfo(null); }}
                className="w-full text-center text-xs text-fd-muted-foreground underline-offset-2 hover:underline"
              >
                Use a different email
              </button>
            </form>
          )}

          <div className="flex items-center gap-3 text-xs text-fd-muted-foreground">
            <div className="h-px flex-1 bg-fd-border" />
            or continue with
            <div className="h-px flex-1 bg-fd-border" />
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleSocial("google")}
              disabled={loading === "google"}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm font-medium transition-colors hover:bg-fd-accent disabled:opacity-50"
            >
              <GoogleIcon />
              {loading === "google" ? "Redirecting…" : "Continue with Google"}
            </button>
            <button
              type="button"
              onClick={() => handleSocial("apple")}
              disabled={loading === "apple"}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm font-medium transition-colors hover:bg-fd-accent disabled:opacity-50"
            >
              <AppleIcon />
              {loading === "apple" ? "Redirecting…" : "Continue with Apple"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-fd-muted-foreground">
          Not on FreeSolo yet?{" "}
          <a href="/apply" className="font-medium text-fd-foreground underline underline-offset-2">
            Apply to join
          </a>{" "}
          — we review every story personally.
        </p>
      </div>
    </div>
  );
}

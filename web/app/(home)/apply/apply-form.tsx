"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

const MIN_STORY_LENGTH = 80;

export function ApplyForm() {
  const [story, setStory] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = story.length >= MIN_STORY_LENGTH && email.length > 0 && phone.length > 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story, email, phone }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="space-y-4 rounded-xl border border-fd-border bg-fd-card p-8 text-center">
        <span className="text-4xl">🌿</span>
        <h2 className="text-xl font-semibold tracking-tight">Application received</h2>
        <p className="text-sm text-fd-muted-foreground">
          We review every story personally. Expect a response within 48 hours — keep an eye on
          your inbox. Once approved, open the FreeSolo app and sign in with this email.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-fd-border bg-fd-card p-6 sm:p-8">
      <div className="space-y-1.5">
        <label htmlFor="story" className="text-sm font-medium">
          Your solo travel story
        </label>
        <textarea
          id="story"
          required
          rows={6}
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Describe one of your solo travel experiences. Where did you go? What did you discover? What made it authentic and memorable?"
          className="w-full resize-none rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none ring-fd-ring focus:ring-2"
        />
        <p className={`text-right text-xs ${story.length >= MIN_STORY_LENGTH ? "text-fd-foreground" : "text-fd-muted-foreground"}`}>
          {story.length} / {MIN_STORY_LENGTH} min
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
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

      <div className="space-y-1.5">
        <label htmlFor="phone" className="text-sm font-medium">
          Phone number
        </label>
        <input
          id="phone"
          type="tel"
          required
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 234 567 8900"
          className="w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none ring-fd-ring focus:ring-2"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-fd-error/10 px-3 py-2 text-sm text-fd-error">{error}</p>
      )}

      <button
        type="submit"
        disabled={!canSubmit || loading}
        className="w-full rounded-lg bg-fd-primary px-3 py-2 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Submitting…" : "Submit application"}
      </button>

      <p className="text-center text-xs text-fd-muted-foreground">
        Want to add a photo from your trip? You can do that from the FreeSolo app after you sign in.
      </p>
    </form>
  );
}

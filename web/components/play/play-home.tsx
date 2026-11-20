"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Check, Loader2, Lock, MapPin, Minus, Plus, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { api } from "@/lib/client-api";
import { RouteMap } from "@/components/map/route-map";
import type { CitySummary, JourneyView, LessonCard } from "@/lib/play";
import { RankChip } from "./star-badge";
import { usePlayer } from "./use-player";

const TRIP_KEY = "freesolo.play.trip.v1";
const COMING_SOON = [
  { name: "Lisbon", emoji: "🚋" },
  { name: "Rome", emoji: "🏛️" },
  { name: "Kyoto", emoji: "⛩️" },
];

interface Trip { cityId: string; startDate: string; days: number }

function savedTrip(): Trip | null {
  try {
    const raw = localStorage.getItem(TRIP_KEY);
    return raw ? (JSON.parse(raw) as Trip) : null;
  } catch {
    return null;
  }
}

export function PlayHome({ signedIn }: { signedIn: boolean }) {
  const player = usePlayer(signedIn);
  const [cities, setCities] = useState<CitySummary[] | null>(null);
  const [trip, setTrip] = useState<Trip>({ cityId: "", startDate: "", days: 2 });
  const [journey, setJourney] = useState<JourneyView | null>(null);
  const [loading, setLoading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cities, then the last trip this browser planned (if any).
  useEffect(() => {
    let live = true;
    api<CitySummary[]>("/api/play/cities")
      .then((list) => {
        if (!live) return;
        setCities(list);
        const last = savedTrip();
        if (last && list.some((c) => c.id === last.cityId)) {
          setTrip(last);
          build(last);
        } else if (list[0]) {
          setTrip((t) => ({ ...t, cityId: list[0].id }));
        }
      })
      .catch((e) => live && setError(e.message));
    return () => { live = false; };
  }, []);

  async function build(t: Trip) {
    setLoading(true);
    setError(null);
    try {
      const j = await api<JourneyView>("/api/play/journeys", {
        method: "POST",
        body: JSON.stringify({ cityId: t.cityId, startDate: t.startDate || null, days: t.days }),
      });
      setJourney(j);
      try { localStorage.setItem(TRIP_KEY, JSON.stringify(t)); } catch { /* not saved */ }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't build your journey");
    } finally {
      setLoading(false);
    }
  }

  async function unlock() {
    if (!journey) return;
    setUnlocking(true);
    try {
      await api(`/api/play/cities/${journey.city.id}/unlock`, { method: "POST" });
      player.refresh();
      await build(trip);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't unlock this city");
    } finally {
      setUnlocking(false);
    }
  }

  function reset() {
    setJourney(null);
    try { localStorage.removeItem(TRIP_KEY); } catch { /* ignore */ }
  }

  const rank = player.rank;

  if (!journey) {
    return (
      <div className="container-page py-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow">Play a city</p>
            {rank && <RankChip rankKey={rank.key} name={rank.name} stardust={player.stardust} />}
          </div>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Where are you <span className="text-sunset">travelling?</span>
          </h1>
          <p className="mt-4 text-lg text-ink-soft">
            Pick your city and how long you&apos;re there. We&apos;ll turn its history into a walk of
            levels — each one a short lesson you solve on the spot.
          </p>

          <form
            className="card mt-8 space-y-6 p-5 sm:p-7"
            onSubmit={(e) => { e.preventDefault(); if (trip.cityId) build(trip); }}
          >
            <fieldset>
              <legend className="text-sm font-semibold">City</legend>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {cities === null && !error && (
                  <div className="col-span-full flex items-center gap-2 text-sm text-ink-soft">
                    <Loader2 className="size-4 animate-spin" /> Loading cities…
                  </div>
                )}
                {cities?.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setTrip((t) => ({ ...t, cityId: c.id }))}
                    aria-pressed={trip.cityId === c.id}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition",
                      trip.cityId === c.id ? "border-sunset bg-sunset-soft ring-4 ring-sunset/10" : "border-line hover:border-ink-soft/40"
                    )}
                  >
                    <span className="text-2xl">{c.emoji}</span>
                    <span className="mt-2 block font-display font-bold">{c.name}</span>
                    <span className="block text-xs text-ink-soft">{c.lessons} levels · {c.freeLessons} free</span>
                  </button>
                ))}
                {cities && COMING_SOON.map((c) => (
                  <div key={c.name} className="rounded-2xl border border-dashed border-line p-4 text-left opacity-60">
                    <span className="text-2xl grayscale">{c.emoji}</span>
                    <span className="mt-2 block font-display font-bold">{c.name}</span>
                    <span className="block text-xs text-ink-soft">Coming soon</span>
                  </div>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold">Arriving</span>
                <span className="relative mt-2 block">
                  <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
                  <input
                    type="date"
                    value={trip.startDate}
                    onChange={(e) => setTrip((t) => ({ ...t, startDate: e.target.value }))}
                    className="field pl-10"
                  />
                </span>
              </label>
              <div>
                <span className="text-sm font-semibold">Days to play</span>
                <div className="mt-2 flex items-center gap-2">
                  <button type="button" aria-label="Fewer days" onClick={() => setTrip((t) => ({ ...t, days: Math.max(1, t.days - 1) }))} className="btn-outline size-11 p-0">
                    <Minus className="size-4" />
                  </button>
                  <span className="w-16 text-center font-display text-xl font-bold" aria-live="polite">
                    {trip.days} {trip.days === 1 ? "day" : "days"}
                  </span>
                  <button type="button" aria-label="More days" onClick={() => setTrip((t) => ({ ...t, days: Math.min(7, t.days + 1) }))} className="btn-outline size-11 p-0">
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <button type="submit" disabled={!trip.cityId || loading} className="btn-primary w-full py-3 text-[15px]">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Build my journey
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-ink-soft">
            Free levels need no account. <Link href="/docs/play" className="font-semibold text-sunset hover:underline">How the game works</Link>
          </p>
        </div>
      </div>
    );
  }

  // Merge this browser's progress for signed-out players.
  const withProgress = (l: LessonCard): LessonCard => ({ ...l, solved: l.solved || player.solved.has(l.id) });
  const days = journey.days.map((d) => ({ ...d, lessons: d.lessons.map(withProgress) }));
  const all = days.flatMap((d) => d.lessons);
  const solvedCount = all.filter((l) => l.solved).length;
  const locked = all.filter((l) => l.locked).length;
  const next = all.find((l) => !l.solved && !l.locked);

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Your journey</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {journey.city.emoji} {journey.city.name}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {solvedCount}/{all.length} levels solved · {days.length} {days.length === 1 ? "day" : "days"}
            {journey.startDate ? ` from ${new Date(journey.startDate + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {rank && <RankChip rankKey={rank.key} name={rank.name} stardust={player.stardust} />}
          <button type="button" onClick={reset} className="btn-ghost btn-sm"><RotateCcw className="size-4" /> Change trip</button>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-fd-muted" aria-hidden>
        <div className="h-full rounded-full bg-sunset transition-all" style={{ width: `${(solvedCount / Math.max(1, all.length)) * 100}%` }} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="min-w-0 space-y-7">
          {next && (
            <Link href={`/play/lessons/${next.id}`} className="card flex items-center gap-4 border-sunset/40 bg-sunset-soft p-5 transition hover:border-sunset">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sunset text-white">
                <Sparkles className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold uppercase tracking-wide text-sunset">Next level</span>
                <span className="block truncate font-display text-lg font-bold">{next.title}</span>
                <span className="block truncate text-sm text-ink-soft">{next.place}</span>
              </span>
              <ArrowRight className="size-5 text-sunset" />
            </Link>
          )}

          {days.map((d) => (
            <section key={d.day} aria-label={`Day ${d.day}`}>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">Day {d.day}</h2>
              <ol className="space-y-3">
                {d.lessons.map((l) => (
                  <li key={l.id}><LevelRow lesson={l} number={all.indexOf(l) + 1} /></li>
                ))}
              </ol>
            </section>
          ))}

          {locked > 0 && (
            <div className="card overflow-hidden">
              <div className="flex items-start gap-4 p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-navy text-white dark:bg-sunset">
                  <Lock className="size-5" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold">{journey.city.name} city pack</h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    {locked} more levels with deeper stories. Yours to replay forever.
                    <span className="font-semibold text-ink"> Free while we&apos;re in pilot.</span>
                  </p>
                </div>
              </div>
              <div className="border-t border-line p-4">
                {signedIn ? (
                  <button type="button" onClick={unlock} disabled={unlocking} className="btn-primary w-full">
                    {unlocking ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Unlock {journey.city.name}
                  </button>
                ) : (
                  <Link href={`/sign-in?next=${encodeURIComponent("/play")}`} className="btn-dark w-full">Sign in to unlock</Link>
                )}
              </div>
            </div>
          )}
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="isolate h-[340px] overflow-hidden rounded-3xl border border-line sm:h-[440px] lg:h-[560px]">
            <RouteMap
              stops={all.map((l) => ({ name: l.place, lat: l.lat, lng: l.lng }))}
              line={journey.route?.coordinates ?? null}
              estimated={journey.route?.estimated}
              fitMaxZoom={16}
              className="h-full w-full"
            />
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft">
            <MapPin className="size-3.5" /> Walking order · numbers match your levels
          </p>
        </div>
      </div>
    </div>
  );
}

function LevelRow({ lesson: l, number }: { lesson: LessonCard; number: number }) {
  return (
    <Link
      href={`/play/lessons/${l.id}`}
      className={cn("card flex items-center gap-4 p-4 transition hover:border-ink-soft/40", l.solved && "bg-surface/60")}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold",
          l.solved ? "bg-sage text-white" : l.locked ? "bg-fd-muted text-ink-soft" : "bg-navy text-white dark:bg-sunset"
        )}
      >
        {l.solved ? <Check className="size-4" /> : l.locked ? <Lock className="size-4" /> : number}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-ink">{l.title}</span>
        <span className="block truncate text-sm text-ink-soft">{l.place} · {l.era}</span>
      </span>
      <span className="shrink-0 text-right text-xs text-ink-soft">
        {l.free && !l.solved && <span className="mb-1 block font-semibold text-sage">Free</span>}
        {l.minutes} min
      </span>
    </Link>
  );
}

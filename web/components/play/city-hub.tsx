"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Loader2, Lock, Map as MapIcon, Minus, Plus, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/cn";
import { api, ClientApiError } from "@/lib/client-api";
import { RouteMap } from "@/components/map/route-map";
import { cityGradient, readGuest, serverGuest, subscribeGuest, type JourneyView, type LessonCard } from "@/lib/play";
import { LevelPath } from "./level-path";
import { RankChip } from "./star-badge";
import { usePlayer } from "./use-player";

const TRIP_KEY = "freesolo.play.trips.v2";
type Trip = { days: number; startDate: string };

function loadTrip(cityId: string): Trip {
  try {
    const all = JSON.parse(localStorage.getItem(TRIP_KEY) ?? "{}");
    return { days: 2, startDate: "", ...(all[cityId] ?? {}) };
  } catch {
    return { days: 2, startDate: "" };
  }
}
function saveTrip(cityId: string, trip: Trip) {
  try {
    const all = JSON.parse(localStorage.getItem(TRIP_KEY) ?? "{}");
    localStorage.setItem(TRIP_KEY, JSON.stringify({ ...all, [cityId]: trip }));
  } catch { /* not saved */ }
}

function dayLabel(startDate: string, day: number) {
  if (!startDate) return null;
  const d = new Date(startDate + "T12:00:00");
  d.setDate(d.getDate() + day - 1);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

/** Step two of the game: a city's journey — its story, your days, and the level path. */
export function CityHub({ cityId, signedIn }: { cityId: string; signedIn: boolean }) {
  const player = usePlayer(signedIn);
  const guest = useSyncExternalStore(subscribeGuest, readGuest, serverGuest);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [journey, setJourney] = useState<JourneyView | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [version, setVersion] = useState(0);

  // The trip lives in this browser; read it once on the client.
  useEffect(() => {
    const t = loadTrip(cityId);
    const id = setTimeout(() => setTrip(t), 0);
    return () => clearTimeout(id);
  }, [cityId]);

  useEffect(() => {
    if (!trip) return;
    let live = true;
    api<JourneyView>("/api/play/journeys", {
      method: "POST",
      body: JSON.stringify({ cityId, days: trip.days, startDate: trip.startDate || null }),
    })
      .then((j) => { if (live) { setJourney(j); setError(null); } })
      .catch((e) => {
        if (!live) return;
        if (e instanceof ClientApiError && e.status === 404) setNotFound(true);
        else setError(e instanceof Error ? e.message : "Couldn't load this city");
      });
    return () => { live = false; };
  }, [cityId, trip, version]);

  function changeTrip(next: Trip) {
    setTrip(next);
    saveTrip(cityId, next);
  }

  async function unlock() {
    setUnlocking(true);
    try {
      await api(`/api/play/cities/${cityId}/unlock`, { method: "POST" });
      player.refresh();
      setVersion((v) => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't unlock this city");
    } finally {
      setUnlocking(false);
    }
  }

  if (notFound) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-3xl font-extrabold">We don&apos;t have that city yet</h1>
        <Link href="/play" className="btn-primary mt-6">Pick another city</Link>
      </div>
    );
  }
  if (!journey || !trip) {
    return <div className="flex justify-center py-32 text-ink-soft"><Loader2 className="size-6 animate-spin" /></div>;
  }

  const city = journey.city;
  const solvedHere = (l: LessonCard) => l.solved || !!guest.solved[l.id];
  const days = journey.days.map((d) => ({ ...d, lessons: d.lessons.map((l) => ({ ...l, solved: solvedHere(l) })) }));
  const all = days.flatMap((d) => d.lessons);
  const numbers = new Map(all.map((l, i) => [l.id, i + 1]));
  const solved = all.filter((l) => l.solved).length;
  const locked = all.filter((l) => l.locked);
  const next = all.find((l) => !l.solved && !l.locked) ?? null;
  const freeDone = all.filter((l) => l.free).every((l) => l.solved);
  const complete = solved === all.length;
  const rank = player.rank;

  const packCard = locked.length > 0 && (
    <div className={cn("card overflow-hidden", freeDone && "ring-2 ring-sunset")}>
      <div className="flex items-start gap-4 p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-navy text-white dark:bg-sunset"><Lock className="size-5" /></span>
        <div>
          <p className="font-display text-lg font-bold">{freeDone ? `Keep going in ${city.name}` : `${city.name} city pack`}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {locked.length} more levels with deeper stories — yours to replay for good.{" "}
            <span className="font-semibold text-ink">Free during the pilot.</span>
          </p>
        </div>
      </div>
      <div className="border-t border-line p-4">
        {signedIn ? (
          <button type="button" onClick={unlock} disabled={unlocking} className="btn-primary w-full">
            {unlocking ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Unlock {locked.length} levels
          </button>
        ) : (
          <Link href={`/sign-in?next=${encodeURIComponent(`/play/${cityId}`)}`} className="btn-dark w-full">Sign in to unlock</Link>
        )}
      </div>
    </div>
  );

  const map = (
    <div className="isolate h-[320px] overflow-hidden rounded-3xl border border-line lg:h-[520px]">
      <RouteMap
        stops={all.map((l) => ({ name: l.place, lat: l.lat, lng: l.lng }))}
        line={journey.route?.coordinates ?? null}
        estimated={journey.route?.estimated}
        fitMaxZoom={16}
        className="h-full w-full"
      />
    </div>
  );

  return (
    <div>
      {/* City hero */}
      <section className="relative overflow-hidden text-white" style={{ background: cityGradient(city) }}>
        <svg aria-hidden className="absolute inset-0 size-full opacity-20" viewBox="0 0 800 300" preserveAspectRatio="none">
          <path d="M-20 260 C 160 160, 300 300, 460 180 S 700 60, 820 120" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="3 14" strokeLinecap="round" />
        </svg>
        <span aria-hidden className="pointer-events-none absolute -bottom-4 -right-4 text-[8rem] leading-none opacity-20 drop-shadow-2xl sm:right-12 sm:text-[12rem] sm:opacity-90">{city.emoji}</span>
        <div className="container-page relative z-10 py-8 sm:py-12">
          <Link href="/play" className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white"><ArrowLeft className="size-4" /> All cities</Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">{city.country}</p>
          <h1 className="mt-1 font-display text-5xl font-extrabold tracking-tight sm:text-6xl">{city.name}</h1>
          <p className="mt-2 font-display text-xl font-bold text-white/90">{city.tagline}</p>
          <p className="mt-4 max-w-2xl leading-relaxed text-white/85 lg:max-w-3xl">{city.intro}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {next ? (
              <Link href={`/play/lessons/${next.id}`} className="btn bg-white px-6 py-3 text-[15px] text-navy shadow-lg hover:bg-white/90">
                {solved === 0 ? "Start level 1" : `Continue · level ${numbers.get(next.id)}`} <ArrowRight className="size-4" />
              </Link>
            ) : complete ? (
              <Link href="/sky" className="btn bg-white px-6 py-3 text-[15px] text-navy"><Trophy className="size-4" /> City complete — see your sky</Link>
            ) : null}
            <span className="rounded-full bg-black/20 px-3.5 py-2 text-sm font-semibold backdrop-blur">{solved}/{all.length} solved</span>
          </div>
        </div>
      </section>

      <div className="container-page py-8">
        {/* Trip controls */}
        <div className="card flex flex-wrap items-center gap-x-6 gap-y-4 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">Days in {city.name}</span>
            <button type="button" aria-label="Fewer days" onClick={() => changeTrip({ ...trip, days: Math.max(1, trip.days - 1) })} className="btn-outline size-9 p-0"><Minus className="size-4" /></button>
            <span className="w-6 text-center font-display text-lg font-bold" aria-live="polite">{trip.days}</span>
            <button type="button" aria-label="More days" onClick={() => changeTrip({ ...trip, days: Math.min(7, trip.days + 1) })} className="btn-outline size-9 p-0"><Plus className="size-4" /></button>
          </div>
          <label className="flex items-center gap-3">
            <span className="text-sm font-semibold">Arriving</span>
            <span className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
              <input type="date" value={trip.startDate} onChange={(e) => changeTrip({ ...trip, startDate: e.target.value })} className="field w-auto py-2 pl-9" />
            </span>
          </label>
          <div className="ml-auto flex items-center gap-2">
            {rank && <RankChip rankKey={rank.key} name={rank.name} stardust={player.stardust} />}
            <button type="button" onClick={() => setShowMap((v) => !v)} className="btn-outline btn-sm lg:hidden" aria-expanded={showMap}>
              <MapIcon className="size-4" /> {showMap ? "Hide map" : "Map"}
            </button>
          </div>
        </div>

        {complete && (
          <div className="mt-6 flex items-center gap-4 rounded-3xl bg-sunset-soft p-5">
            <Trophy className="size-8 shrink-0 text-sunset" />
            <p className="text-ink"><span className="font-display font-bold">You&apos;ve solved all of {city.name}!</span> Its constellation is complete in your sky.</p>
          </div>
        )}
        {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.05fr]">
          <div className="min-w-0 space-y-8">
            {showMap && <div className="lg:hidden">{map}</div>}
            {days.map((d) => (
              <section key={d.day} aria-label={`Day ${d.day}`}>
                <h2 className="mb-2 flex items-baseline gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-sunset">Day {d.day}</span>
                  {dayLabel(trip.startDate, d.day) && <span className="text-xs text-ink-soft">{dayLabel(trip.startDate, d.day)}</span>}
                </h2>
                <LevelPath lessons={d.lessons} numbers={numbers} currentId={next?.id ?? null} />
              </section>
            ))}
            {packCard}
          </div>
          <div className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
            {map}
            <p className="mt-2 text-xs text-ink-soft">Walking order · map numbers match your levels</p>
          </div>
        </div>
      </div>
    </div>
  );
}

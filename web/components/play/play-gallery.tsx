"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowRight, Camera, Loader2, MapPinned, Sparkles } from "lucide-react";
import { api } from "@/lib/client-api";
import { readGuest, serverGuest, solvedIn, subscribeGuest, cityGradient, type CitySummary } from "@/lib/play";
import { CityCard } from "./city-card";
import { RankChip } from "./star-badge";
import { usePlayer } from "./use-player";

/** Step one of the game: pick a city. */
export function PlayGallery({ signedIn }: { signedIn: boolean }) {
  const player = usePlayer(signedIn);
  const guest = useSyncExternalStore(subscribeGuest, readGuest, serverGuest);
  const [cities, setCities] = useState<CitySummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    api<CitySummary[]>("/api/play/cities").then((c) => live && setCities(c)).catch((e) => live && setError(e.message));
    return () => { live = false; };
  }, []);

  const withProgress = (cities ?? []).map((c) => ({ city: c, solved: solvedIn(c.id, c.solved, guest) }));
  const current = withProgress
    .filter((c) => c.solved > 0 && c.solved < c.city.lessons)
    .sort((a, b) => b.solved - a.solved)[0];
  const rank = player.rank;

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow">Play a city</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Where are you <span className="text-sunset">travelling?</span>
          </h1>
          <p className="mt-3 text-lg text-ink-soft">
            Pick a city. Each one is a walk of history levels you solve on the spot — the first three are free.
          </p>
        </div>
        {rank && <RankChip rankKey={rank.key} name={rank.name} stardust={player.stardust} />}
      </div>

      {current && (
        <Link
          href={`/play/${current.city.id}`}
          className="mt-8 flex items-center gap-4 overflow-hidden rounded-3xl p-5 text-white shadow-lg transition hover:shadow-xl"
          style={{ background: cityGradient(current.city) }}
        >
          <span className="text-4xl">{current.city.emoji}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-white/80">Continue your journey</span>
            <span className="block font-display text-xl font-extrabold">{current.city.name} · {current.solved}/{current.city.lessons} levels</span>
          </span>
          <span className="btn bg-white px-4 py-2 text-navy">Continue <ArrowRight className="size-4" /></span>
        </Link>
      )}

      {error && <p className="mt-8 text-red-600 dark:text-red-400">{error}</p>}
      {cities === null && !error ? (
        <div className="mt-10 flex items-center gap-2 text-ink-soft"><Loader2 className="size-4 animate-spin" /> Loading cities…</div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {withProgress.map(({ city, solved }) => <CityCard key={city.id} city={city} solved={solved} />)}
          <div className="card flex flex-col justify-center border-dashed p-6 text-center">
            <p className="font-display text-lg font-bold">More cities soon</p>
            <p className="mt-1 text-sm text-ink-soft">Lisbon, Rome and Kyoto are being researched.</p>
          </div>
        </div>
      )}

      <ol className="mt-14 grid gap-4 sm:grid-cols-3">
        {[
          { icon: MapPinned, title: "Pick a city", body: "Say how many days you have — we split the levels into walks." },
          { icon: Camera, title: "Solve on the spot", body: "Look closely, then type what you found or snap a photo." },
          { icon: Sparkles, title: "Unlock the story", body: "Learn what really happened there and light a star in your sky." },
        ].map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="flex gap-4 rounded-3xl bg-surface/60 p-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-sunset-soft text-sunset"><Icon className="size-5" /></span>
            <span>
              <span className="block text-xs font-bold text-ink-soft">Step {i + 1}</span>
              <span className="block font-display font-bold">{title}</span>
              <span className="mt-0.5 block text-sm text-ink-soft">{body}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

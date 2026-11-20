"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { api } from "@/lib/client-api";
import { RANK_STYLE, rankProgress, type CitySummary, type CityView } from "@/lib/play";
import { NightSky } from "./night-sky";
import { StarOrb } from "./star-badge";
import { usePlayer } from "./use-player";

export function SkyScreen({ signedIn }: { signedIn: boolean }) {
  const player = usePlayer(signedIn);
  const [cities, setCities] = useState<CityView[] | null>(null);

  useEffect(() => {
    let live = true;
    api<CitySummary[]>("/api/play/cities")
      .then((list) => Promise.all(list.map((c) => api<CityView>(`/api/play/cities/${c.id}`))))
      .then((views) => live && setCities(views))
      .catch(() => live && setCities([]));
    return () => { live = false; };
  }, []);

  const rank = player.rank;
  const progress = rankProgress(player.stardust, rank);
  const lit = player.solved.size;
  const playedCities = (cities ?? []).filter((c) => c.lessons.some((l) => player.solved.has(l.id)));
  const skyCities = playedCities.length ? playedCities : (cities ?? []).slice(0, 1);

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="min-w-0 space-y-6">
          <div>
            <p className="eyebrow">My sky</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
              {rank ? <>You&apos;re a <span className="text-sunset">{rank.name}</span></> : "Your sky"}
            </h1>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-5">
              {rank ? <StarOrb rankKey={rank.key} size={72} /> : <span className="size-[72px] animate-pulse rounded-full bg-fd-muted" />}
              <div className="min-w-0 flex-1">
                <p className="font-display text-3xl font-extrabold">✨ {player.stardust.toLocaleString("en")}</p>
                <p className="text-sm text-ink-soft">stardust · {lit} {lit === 1 ? "star" : "stars"} lit</p>
              </div>
            </div>
            {rank && (
              <>
                <p className="mt-4 text-sm text-ink-soft">{RANK_STYLE[rank.key]?.blurb}</p>
                {rank.nextAt != null ? (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-ink-soft">
                      <span>{rank.name}</span>
                      <span>{(rank.nextAt - player.stardust).toLocaleString("en")} to {rank.nextName}</span>
                    </div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-fd-muted">
                      <div className="h-full rounded-full bg-sunset transition-all" style={{ width: `${progress * 100}%` }} />
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm font-semibold text-sunset">The top of the ladder. Nothing escapes your gravity.</p>
                )}
              </>
            )}
            {!signedIn && (
              <p className="mt-5 border-t border-line pt-4 text-xs text-ink-soft">
                Saved in this browser only. <Link href={`/sign-in?next=${encodeURIComponent("/sky")}`} className="font-semibold text-sunset">Sign in</Link> to keep your sky on every device.
              </p>
            )}
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">The star ladder</h2>
            <ol className="mt-3 space-y-1.5">
              {player.ranks.map((r) => {
                const current = rank?.key === r.key;
                const reached = player.stardust >= r.minStardust;
                return (
                  <li
                    key={r.key}
                    className={cn("flex items-center gap-3 rounded-2xl px-3 py-2", current && "bg-sunset-soft ring-1 ring-sunset/30", !reached && "opacity-55")}
                  >
                    <StarOrb rankKey={r.key} size={28} />
                    <span className="flex-1 font-semibold">{r.name}</span>
                    <span className="text-xs text-ink-soft">✨ {r.minStardust.toLocaleString("en")}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <div>
          {cities === null ? (
            <div className="flex aspect-[800/440] items-center justify-center rounded-[28px] bg-[#0A121A] text-white/60">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : (
            <NightSky cities={skyCities} solved={player.solved} className="w-full" />
          )}
          <p className="mt-3 text-sm text-ink-soft">
            Every level you solve lights a star where it stands in the city. Finish a city and its
            constellation joins up in sunset orange.
          </p>
          {lit === 0 && (
            <Link href="/play" className="btn-primary mt-5">Light your first star <ArrowRight className="size-4" /></Link>
          )}
        </div>
      </div>
    </div>
  );
}

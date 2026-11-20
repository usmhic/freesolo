"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { api } from "@/lib/client-api";
import { useI18n } from "@/lib/i18n/client";
import { rankProgress, type CitySummary, type CityView } from "@/lib/play";
import { NightSky } from "./night-sky";
import { StarOrb, useRankText } from "./star-badge";
import { PlacePhoto } from "./place-photo";
import { usePlayer } from "./use-player";

export function SkyScreen({ signedIn }: { signedIn: boolean }) {
  const { t, num, fill } = useI18n();
  const rankText = useRankText();
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
  const postcards = (cities ?? []).flatMap((c) =>
    c.lessons.filter((l) => player.solved.has(l.id)).map((lesson) => ({ lesson, city: c.city })));

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="min-w-0 space-y-6">
          <div>
            <p className="eyebrow">My sky</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
              {rank ? <>{t.sky.youAre} <span className="text-sunset">{rankText(rank.key).name}</span></> : t.sky.yourSky}
            </h1>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-5">
              {rank ? <StarOrb rankKey={rank.key} size={72} /> : <span className="size-[72px] animate-pulse rounded-full bg-fd-muted" />}
              <div className="min-w-0 flex-1">
                <p className="font-display text-3xl font-extrabold">✨ {num(player.stardust)}</p>
                <p className="text-sm text-ink-soft">{fill(t.sky.starsLit, { word: t.common.stardust, n: lit })}</p>
              </div>
            </div>
            {rank && (
              <>
                <p className="mt-4 text-sm text-ink-soft">{rankText(rank.key).blurb}</p>
                {rank.nextAt != null ? (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-ink-soft">
                      <span>{rankText(rank.key).name}</span>
                      <span>{fill(t.sky.toNext, { n: num(rank.nextAt - player.stardust), rank: rankText(player.ranks[player.ranks.findIndex((r) => r.key === rank.key) + 1]?.key ?? rank.key).name })}</span>
                    </div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-fd-muted">
                      <div className="h-full rounded-full bg-sunset transition-all" style={{ width: `${progress * 100}%` }} />
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm font-semibold text-sunset">{t.sky.top}</p>
                )}
              </>
            )}
            {!signedIn && (
              <p className="mt-5 border-t border-line pt-4 text-xs text-ink-soft">
                {t.sky.browserOnly} <Link href={`/sign-in?next=${encodeURIComponent("/sky")}`} className="font-semibold text-sunset">{t.common.signIn}</Link> {t.sky.keepSky}
              </p>
            )}
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">{t.sky.ladder}</h2>
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
                    <span className="flex-1 font-semibold">{rankText(r.key).name}</span>
                    <span className="text-xs text-ink-soft">✨ {num(r.minStardust)}</span>
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
            <NightSky cities={skyCities} solved={player.solved} label={t.sky.skyLabel} className="w-full" />
          )}
          <p className="mt-3 text-sm text-ink-soft">{t.sky.caption}</p>
          {lit === 0 && (
            <Link href="/play" className="btn-primary mt-5">{t.sky.firstStar} <ArrowRight className="size-4" /></Link>
          )}

          {postcards.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">{fill(t.sky.postcards, { n: postcards.length })}</h2>
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {postcards.map(({ lesson, city }, i) => (
                  <li key={lesson.id}>
                    <Link
                      href={`/play/lessons/${lesson.id}`}
                      className="group block overflow-hidden rounded-2xl bg-surface p-1.5 shadow-sm ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-md"
                      style={{ rotate: `${[-1.5, 1, -0.5, 1.5][i % 4]}deg` }}
                    >
                      <PlacePhoto photo={lesson.photo} width={330} alt={lesson.place} colors={city.colors} emoji={city.emoji} className="aspect-[4/3] rounded-xl" />
                      <p className="truncate px-1 pt-1.5 text-xs font-semibold text-ink">{lesson.title}</p>
                      <p className="truncate px-1 pb-0.5 text-[11px] text-ink-soft">{city.emoji} {city.name} · {lesson.era}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

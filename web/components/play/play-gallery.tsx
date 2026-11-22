"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowRight, Camera, Loader2, MapPinned, Sparkles } from "lucide-react";
import { api } from "@/lib/browser-api";
import { useI18n } from "@/lib/i18n/client";
import { readGuest, serverGuest, solvedIn, subscribeGuest, cityGradient, type CitySummary } from "@/lib/play";
import { CityCard } from "./city-card";
import { RankChip } from "./star-badge";
import { usePlayer } from "./use-player";
import { SectionHeading } from "@/components/site/section-heading";

/** Step one of the game: pick a city. */
export function PlayGallery({ signedIn }: { signedIn: boolean }) {
  const { t, fill } = useI18n();
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
      <SectionHeading
        as="h1"
        eyebrow={t.play.eyebrow}
        title={<>{t.play.titleA} <span className="text-sunset">{t.play.titleB}</span></>}
        lead={t.play.lead}
        action={rank && <RankChip rankKey={rank.key} stardust={player.stardust} />}
      />

      {current && (
        <Link
          href={`/play/${current.city.id}`}
          className="mt-8 flex items-center gap-3 overflow-hidden rounded-3xl p-4 text-white shadow-lg transition hover:shadow-xl sm:gap-4 sm:p-5"
          style={{ background: cityGradient(current.city) }}
        >
          <span className="text-3xl sm:text-4xl">{current.city.emoji}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold uppercase tracking-[0.14em] text-white/80">{t.play.continue}</span>
            <span className="block truncate font-display text-xl font-extrabold">{current.city.name} · {current.solved}/{current.city.lessons}</span>
          </span>
          {/* The whole card is the link; on phones the button shrinks to an arrow. */}
          <span className="btn size-10 shrink-0 bg-white p-0 text-navy sm:size-auto sm:px-4 sm:py-2">
            <span className="sr-only sm:not-sr-only">{t.play.continueBtn}</span> <ArrowRight className="size-4" />
          </span>
        </Link>
      )}

      {error && <p className="mt-8 text-red-600 dark:text-red-400">{error}</p>}
      {cities === null && !error ? (
        <div className="mt-10 flex items-center gap-2 text-ink-soft"><Loader2 className="size-4 animate-spin" /> {t.play.loadingCities}</div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {withProgress.map(({ city, solved }) => <CityCard key={city.id} city={city} solved={solved} />)}
          <div className="card flex flex-col justify-center border-dashed p-6 text-center">
            <p className="font-display text-lg font-bold">{t.play.soonTitle}</p>
            <p className="mt-1 text-sm text-ink-soft">{t.play.soonBody}</p>
          </div>
        </div>
      )}

      <ol className="mt-14 grid gap-4 sm:grid-cols-3">
        {[MapPinned, Camera, Sparkles].map((Icon, i) => ({ Icon, title: t.play.steps[i][0], body: t.play.steps[i][1] })).map(({ Icon, title, body }, i) => (
          <li key={title} className="flex gap-4 rounded-3xl bg-surface/60 p-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-sunset-soft text-sunset"><Icon className="size-5" /></span>
            <span>
              <span className="block text-xs font-bold text-ink-soft">{fill(t.play.stepN, { n: i + 1 })}</span>
              <span className="block font-display font-bold">{title}</span>
              <span className="mt-0.5 block text-sm text-ink-soft">{body}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

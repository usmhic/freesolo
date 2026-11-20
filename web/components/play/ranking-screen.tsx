"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Loader2, Trophy } from "lucide-react";
import { cn } from "@/lib/cn";
import { api } from "@/lib/client-api";
import { useI18n } from "@/lib/i18n/client";
import type { Leaderboard, Standing } from "@/lib/play";
import { StarOrb, useRankText } from "./star-badge";

const PERIODS = ["all", "week"] as const;
const MEDALS = ["🥇", "🥈", "🥉"];

/** The global ranking: a podium for the top three, then everyone else. */
export function RankingScreen({ signedIn }: { signedIn: boolean }) {
  const { t, num, fill } = useI18n();
  const [period, setPeriod] = useState<"all" | "week">("all");
  const [boards, setBoards] = useState<Partial<Record<"all" | "week", Leaderboard>>>({});
  const [error, setError] = useState<string | null>(null);
  const board = boards[period];

  useEffect(() => {
    let live = true;
    api<Leaderboard>(`/api/play/leaderboard?period=${period}`)
      .then((b) => live && setBoards((all) => ({ ...all, [period]: b })))
      .catch((e) => live && setError(e.message));
    return () => { live = false; };
  }, [period]);

  const podium = board?.top.slice(0, 3) ?? [];
  const rest = board?.top.slice(3) ?? [];
  const meOutside = board?.me && !board.top.some((s) => s.me) ? board.me : null;

  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <p className="eyebrow">{t.ranking.eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
        {t.ranking.titleA} <span className="text-sunset">{t.ranking.titleB}</span>
      </h1>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label={t.ranking.period} className="inline-flex rounded-full bg-fd-muted p-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={period === p}
              onClick={() => setPeriod(p)}
              className={cn("rounded-full px-4 py-1.5 text-sm font-semibold transition", period === p ? "bg-surface text-ink shadow-sm" : "text-ink-soft hover:text-ink")}
            >
              {t.ranking[p]}
            </button>
          ))}
        </div>
        {board && <span className="text-sm text-ink-soft">{fill(board.players === 1 ? t.ranking.player : t.ranking.players, { n: num(board.players) })}</span>}
      </div>

      {error && <p className="mt-6 text-red-600 dark:text-red-400">{error}</p>}
      {!board && !error && <div className="flex justify-center py-20 text-ink-soft"><Loader2 className="size-6 animate-spin" /></div>}

      {board && board.top.length === 0 && (
        <div className="card mt-8 p-10 text-center">
          <Trophy className="mx-auto size-10 text-sunset" />
          <p className="mt-4 font-display text-xl font-bold">{period === "week" ? t.ranking.emptyWeek : t.ranking.emptyAll}</p>
          <p className="mt-1 text-ink-soft">{t.ranking.emptyLead}</p>
          <Link href="/play" className="btn-primary mt-6">{t.ranking.playCity} <ArrowRight className="size-4" /></Link>
        </div>
      )}

      {podium.length > 0 && (
        <ol className="mt-10 grid grid-cols-3 items-end gap-2 sm:gap-4">
          {[1, 0, 2].map((i) => podium[i]).map((s, slot) =>
            s ? <PodiumStep key={s.position} s={s} height={["h-24", "h-32", "h-20"][slot]} /> : <li key={slot} />
          )}
        </ol>
      )}

      {rest.length > 0 && (
        <ol className="card mt-6 divide-y divide-line overflow-hidden">
          {rest.map((s) => <Row key={s.position} s={s} />)}
        </ol>
      )}

      {meOutside && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">{t.ranking.yourPosition}</p>
          <ol className="card overflow-hidden"><Row s={meOutside} /></ol>
        </div>
      )}

      {board && !signedIn && (
        <div className="mt-8 flex flex-col items-start gap-4 rounded-3xl bg-navy p-6 text-white sm:flex-row sm:items-center dark:bg-navy-deep">
          <Trophy className="size-8 shrink-0 text-sunset" />
          <p className="flex-1 text-white/85"><span className="font-display font-bold text-white">{t.ranking.wantPlace}</span> {t.ranking.wantPlaceLead}</p>
          <Link href={`/sign-in?next=${encodeURIComponent("/ranking")}`} className="btn-primary">{t.common.signIn}</Link>
        </div>
      )}
    </div>
  );
}

function PodiumStep({ s, height }: { s: Standing; height: string }) {
  const { t, num } = useI18n();
  const rankText = useRankText();
  return (
    <li className="flex flex-col items-center text-center">
      <span className="relative">
        <StarOrb rankKey={s.rank.key} size={s.position === 1 ? 76 : 60} />
        <span className={cn("absolute inset-0 flex items-center justify-center font-display text-xl font-extrabold drop-shadow", initialColour(s))}>{s.initial}</span>
        <span className="absolute -end-2 -top-2 text-2xl">{MEDALS[s.position - 1]}</span>
      </span>
      <span className={cn("mt-2 max-w-full truncate font-display font-bold", s.me && "text-sunset")}>{s.me ? t.common.you : s.name}</span>
      <span className="text-sm font-semibold text-sunset">✨ {num(s.stardust)}</span>
      <span className="text-[11px] text-ink-soft">{rankText(s.rank.key).name}</span>
      <span className={cn("mt-2 flex w-full items-start justify-center rounded-t-2xl bg-gradient-to-b from-navy to-navy-deep pt-2 font-display text-2xl font-extrabold text-white/90", height)}>
        {s.position}
      </span>
    </li>
  );
}

function Row({ s }: { s: Standing }) {
  const { t, num, fill } = useI18n();
  const rankText = useRankText();
  return (
    <li className={cn("flex items-center gap-3 px-4 py-3", s.me && "bg-sunset-soft")}>
      <span className="w-7 text-center font-display font-bold text-ink-soft">{s.position}</span>
      <span className="relative">
        <StarOrb rankKey={s.rank.key} size={36} />
        <span className={cn("absolute inset-0 flex items-center justify-center text-sm font-bold drop-shadow", initialColour(s))}>{s.initial}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-semibold">{s.name}</span>
          {s.me && <span className="rounded-full bg-sunset px-2 py-0.5 text-[10px] font-bold uppercase text-white">{t.common.you}</span>}
        </span>
        <span className="block text-xs text-ink-soft">{fill(s.cities === 1 ? t.ranking.rowOne : t.ranking.row, { rank: rankText(s.rank.key).name, solved: s.solved, cities: s.cities })}</span>
      </span>
      <span className="font-display font-bold text-sunset">✨ {num(s.stardust)}</span>
    </li>
  );
}

/** Light orbs (White Dwarf) need dark letters. */
const initialColour = (s: Standing) => (s.rank.key === "white-dwarf" ? "text-navy" : "text-white");

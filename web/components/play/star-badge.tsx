"use client";

import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/client";
import type { Dict } from "@/lib/i18n/dictionaries/en";
import { RANK_STYLE } from "@/lib/play";

/** A glowing orb for a star rank. */
export function StarOrb({ rankKey, size = 40, className }: { rankKey: string; size?: number; className?: string }) {
  const style = RANK_STYLE[rankKey] ?? RANK_STYLE.nebula;
  return (
    <span
      aria-hidden
      className={cn("inline-block shrink-0 rounded-full", className)}
      style={{ width: size, height: size, background: style.orb, boxShadow: `0 0 ${size / 2.5}px ${style.glow}66` }}
    />
  );
}

type RankKey = keyof Dict["ranks"];

/** A rank's name and blurb in the visitor's language. */
export function useRankText() {
  const { t } = useI18n();
  return (key: string) => t.ranks[key as RankKey] ?? t.ranks.nebula;
}

/** Compact rank chip: orb, rank name and stardust. */
export function RankChip({ rankKey, stardust }: { rankKey: string; stardust: number }) {
  const { num } = useI18n();
  const name = useRankText()(rankKey).name;
  return (
    <span className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface py-1 pl-1 pr-3.5 text-sm">
      <StarOrb rankKey={rankKey} size={28} />
      <span className="font-semibold text-ink">{name}</span>
      <span className="text-ink-soft">✨ {num(stardust)}</span>
    </span>
  );
}

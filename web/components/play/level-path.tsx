"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/client";
import type { LessonCard } from "@/lib/play";
import { PlacePhoto } from "./place-photo";

const ROW = 96; // px per level; fixed so the trail can be drawn through the node centres
const NODE = 60;
const OFFSETS = [0, 1, 2, 1]; // a gentle zigzag, in steps

/** A narrower zigzag on phones, so titles keep their room. */
const WIDE = "(min-width: 420px)";
function useStep() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(WIDE);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => (window.matchMedia(WIDE).matches ? 30 : 14),
    () => 14
  );
}

/**
 * One day of the journey as a winding trail of level nodes. `numbers` maps a
 * lesson id to its level number across the whole city.
 */
export function LevelPath({
  lessons,
  numbers,
  currentId,
}: {
  lessons: LessonCard[];
  numbers: Map<string, number>;
  currentId: string | null;
}) {
  const { t, fill } = useI18n();
  const step = useStep();
  const xs = lessons.map((_, i) => NODE / 2 + OFFSETS[i % OFFSETS.length] * step);
  const points = lessons.map((_, i) => `${xs[i]},${ROW * i + ROW / 2}`).join(" ");
  const width = NODE + 2 * step;

  return (
    <ol className="relative" style={{ height: lessons.length * ROW }}>
      {/* Drawn left to right; mirrored in right-to-left languages, like the nodes. */}
      <svg aria-hidden className="pointer-events-none absolute start-0 top-0 rtl:-scale-x-100" width={width} height={lessons.length * ROW}>
        <polyline points={points} fill="none" stroke="var(--line)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={points} fill="none" stroke="var(--sunset)" strokeOpacity="0.55" strokeWidth="2.5" strokeDasharray="2 8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {lessons.map((l, i) => {
        const current = l.id === currentId;
        return (
          <li key={l.id} className="absolute inset-x-0" style={{ top: ROW * i, height: ROW }}>
            <Link href={`/play/lessons/${l.id}`} className="group flex h-full items-center gap-3 sm:gap-4" aria-label={fill(t.city.missionLabel, { n: numbers.get(l.id) ?? 0, title: l.title }) + (l.solved ? t.city.solvedSuffix : l.locked ? t.city.lockedSuffix : "")}>
              <span className="relative shrink-0" style={{ marginInlineStart: xs[i] - NODE / 2, width: NODE, height: NODE }}>
                {current && <span className="absolute -inset-1.5 animate-pulse rounded-full ring-4 ring-sunset/40" />}
                <span
                  className={cn(
                    "relative block size-full overflow-hidden rounded-full border-4 shadow-md transition group-hover:scale-105",
                    l.solved ? "border-sunset" : current ? "border-sunset" : "border-surface ring-1 ring-line"
                  )}
                >
                  <PlacePhoto
                    photo={l.photo}
                    width={330}
                    alt=""
                    colors={["#233846", "#55626C"]}
                    className="absolute inset-0"
                    veiled={l.locked && !l.solved}
                    imgClassName={cn(!l.solved && "grayscale", !l.solved && !l.locked && "opacity-90")}
                  />
                  {l.locked && !l.solved && (
                    <span className="absolute inset-0 flex items-center justify-center bg-navy/45 text-white"><Lock className="size-5" /></span>
                  )}
                </span>
                <span
                  className={cn(
                    "absolute -bottom-1 -end-1 flex size-6 items-center justify-center rounded-full border-2 border-paper font-display text-[11px] font-extrabold",
                    l.solved ? "bg-sunset text-white" : l.locked ? "bg-fd-muted text-ink-soft" : "bg-navy text-white dark:bg-sunset"
                  )}
                >
                  {l.solved ? <Check className="size-3.5" strokeWidth={3.5} /> : numbers.get(l.id)}
                </span>
              </span>
              <span className={cn("min-w-0 flex-1 rounded-2xl px-3 py-2 transition group-hover:bg-surface", current && "bg-surface shadow-sm ring-1 ring-sunset/30")}>
                <span className="flex items-start gap-2">
                  <span className="line-clamp-2 font-display font-bold leading-snug text-ink">{l.title}</span>
                  {l.free && !l.solved && <span className="mt-0.5 shrink-0 rounded-full bg-sage/15 px-2 py-0.5 text-[11px] font-bold uppercase text-sage">{t.common.free}</span>}
                  {current && <span className="mt-0.5 shrink-0 rounded-full bg-sunset px-2 py-0.5 text-[11px] font-bold uppercase text-white">{t.common.next}</span>}
                </span>
                <span className="mt-0.5 flex items-center gap-2 text-sm text-ink-soft">
                  <span className="truncate">{l.place}</span>
                  <span className={cn("shrink-0 text-xs font-bold", l.solved ? "text-ink-soft/60 line-through" : "text-sunset")}>✨ {l.points}</span>
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

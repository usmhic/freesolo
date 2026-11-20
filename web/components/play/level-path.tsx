import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import type { LessonCard } from "@/lib/play";

const ROW = 96; // px per level; fixed so the trail can be drawn through the node centres
const NODE = 56;
const OFFSETS = [0, 1, 2, 1]; // a gentle zigzag, in steps

/**
 * One day of the journey as a winding trail of level nodes. `numbers` maps a
 * lesson id to its level number across the whole city.
 */
export function LevelPath({
  lessons,
  numbers,
  currentId,
  step = 30,
}: {
  lessons: LessonCard[];
  numbers: Map<string, number>;
  currentId: string | null;
  step?: number;
}) {
  const xs = lessons.map((_, i) => NODE / 2 + OFFSETS[i % OFFSETS.length] * step);
  const points = lessons.map((_, i) => `${xs[i]},${ROW * i + ROW / 2}`).join(" ");
  const width = NODE + 2 * step;

  return (
    <ol className="relative" style={{ height: lessons.length * ROW }}>
      <svg aria-hidden className="pointer-events-none absolute left-0 top-0" width={width} height={lessons.length * ROW}>
        <polyline points={points} fill="none" stroke="var(--line)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={points} fill="none" stroke="var(--sunset)" strokeOpacity="0.55" strokeWidth="2.5" strokeDasharray="2 8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {lessons.map((l, i) => {
        const current = l.id === currentId;
        return (
          <li key={l.id} className="absolute inset-x-0" style={{ top: ROW * i, height: ROW }}>
            <Link href={`/play/lessons/${l.id}`} className="group flex h-full items-center gap-4" aria-label={`Level ${numbers.get(l.id)}: ${l.title}${l.solved ? " (solved)" : l.locked ? " (locked)" : ""}`}>
              <span className="relative shrink-0" style={{ marginLeft: xs[i] - NODE / 2, width: NODE, height: NODE }}>
                {current && <span className="absolute -inset-1.5 animate-pulse rounded-full ring-4 ring-sunset/40" />}
                <span
                  className={cn(
                    "relative flex size-full items-center justify-center rounded-full border-4 font-display text-lg font-extrabold shadow-md transition group-hover:scale-105",
                    l.solved && "border-sunset/30 bg-sunset text-white",
                    !l.solved && l.locked && "border-line bg-fd-muted text-ink-soft",
                    !l.solved && !l.locked && current && "border-sunset bg-navy text-white dark:bg-sunset",
                    !l.solved && !l.locked && !current && "border-line bg-surface text-ink"
                  )}
                >
                  {l.solved ? <Check className="size-6" strokeWidth={3} /> : l.locked ? <Lock className="size-5" /> : numbers.get(l.id)}
                </span>
              </span>
              <span className={cn("min-w-0 flex-1 rounded-2xl px-3 py-2 transition group-hover:bg-surface", current && "bg-surface shadow-sm ring-1 ring-sunset/30")}>
                <span className="flex items-center gap-2">
                  <span className="truncate font-display font-bold text-ink">{l.title}</span>
                  {l.free && !l.solved && <span className="shrink-0 rounded-full bg-sage/15 px-2 py-0.5 text-[10px] font-bold uppercase text-sage">Free</span>}
                  {current && <span className="shrink-0 rounded-full bg-sunset px-2 py-0.5 text-[10px] font-bold uppercase text-white">Next</span>}
                </span>
                <span className="block truncate text-sm text-ink-soft">{l.place} · {l.era}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

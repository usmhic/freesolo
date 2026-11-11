"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDistance, formatDuration } from "@/lib/routing";
import type { PlannerStop, RouteResult } from "./types";

/** Keeps stops ordered by day while preserving their order within a day. */
export function sortByDay(stops: PlannerStop[]): PlannerStop[] {
  return stops.map((s, i) => [s, i] as const).sort((a, b) => a[0].day - b[0].day || a[1] - b[1]).map(([s]) => s);
}

export function StopList({
  stops,
  days,
  route,
  activeUid,
  onChange,
  onDaysChange,
  onActivate,
}: {
  stops: PlannerStop[];
  days: number;
  route: RouteResult | null;
  activeUid: string | null;
  onChange: (stops: PlannerStop[]) => void;
  onDaysChange: (days: number) => void;
  onActivate: (uid: string | null) => void;
}) {
  const [dragUid, setDragUid] = useState<string | null>(null);
  const [overUid, setOverUid] = useState<string | null>(null);

  const update = (uid: string, patch: Partial<PlannerStop>) =>
    onChange(sortByDay(stops.map((s) => (s.uid === uid ? { ...s, ...patch } : s))));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= stops.length || from === to) return;
    const next = [...stops];
    const [s] = next.splice(from, 1);
    // A stop moved across a day boundary joins the day it lands in.
    const neighbour = next[Math.min(to, next.length - 1)] ?? s;
    next.splice(to, 0, { ...s, day: to === 0 ? next[0]?.day ?? s.day : neighbour.day });
    onChange(sortByDay(next));
  };

  const dayStats = (d: number) => {
    let dist = 0;
    let dur = 0;
    stops.forEach((s, i) => {
      if (s.day === d && i > 0 && route?.legs[i - 1]) {
        dist += route.legs[i - 1].distanceMeters;
        dur += route.legs[i - 1].durationSeconds;
      }
    });
    return { dist, dur };
  };

  return (
    <div className="space-y-5">
      {Array.from({ length: days }, (_, k) => k + 1).map((d) => {
        const inDay = stops.map((s, i) => ({ s, i })).filter(({ s }) => s.day === d);
        const { dist, dur } = dayStats(d);
        return (
          <section key={d} aria-label={`Day ${d}`}>
            <div className="mb-2 flex items-baseline justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-sunset">Day {d}</h3>
              <span className="text-xs text-ink-soft">
                {dist > 0 ? `${formatDistance(dist)} · ${formatDuration(dur)}` : inDay.length ? "" : "No stops yet"}
              </span>
            </div>
            <ol className="space-y-2">
              {inDay.map(({ s, i }) => {
                const leg = i > 0 ? route?.legs[i - 1] : undefined;
                return (
                  <li
                    key={s.uid}
                    draggable
                    onDragStart={(e) => { setDragUid(s.uid); e.dataTransfer.effectAllowed = "move"; }}
                    onDragOver={(e) => { e.preventDefault(); setOverUid(s.uid); }}
                    onDragLeave={() => setOverUid((u) => (u === s.uid ? null : u))}
                    onDrop={(e) => {
                      e.preventDefault();
                      const from = stops.findIndex((x) => x.uid === dragUid);
                      if (from >= 0) move(from, i);
                      setDragUid(null);
                      setOverUid(null);
                    }}
                    onDragEnd={() => { setDragUid(null); setOverUid(null); }}
                    onClick={() => onActivate(s.uid)}
                    className={cn(
                      "group rounded-2xl border bg-surface p-2.5 transition",
                      activeUid === s.uid ? "border-sunset ring-4 ring-sunset/10" : "border-line hover:border-ink-soft/40",
                      overUid === s.uid && dragUid !== s.uid && "border-sunset",
                      dragUid === s.uid && "opacity-50"
                    )}
                  >
                    {leg && (
                      <p className="mb-2 ml-9 text-[11px] font-medium text-ink-soft">
                        ↓ {formatDistance(leg.distanceMeters)} · {formatDuration(leg.durationSeconds)}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <GripVertical aria-hidden className="size-4 shrink-0 cursor-grab text-ink-soft/50" />
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white dark:bg-sunset">
                        {i + 1}
                      </span>
                      <input
                        value={s.name}
                        onChange={(e) => update(s.uid, { name: e.target.value.slice(0, 200) })}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Name of stop ${i + 1}`}
                        className="min-w-0 flex-1 rounded-lg bg-transparent px-1.5 py-1 text-sm font-semibold text-ink outline-none focus:bg-fd-muted"
                      />
                      <select
                        value={s.day}
                        onChange={(e) => update(s.uid, { day: Number(e.target.value) })}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Day for stop ${i + 1}`}
                        className="rounded-lg border border-line bg-surface px-1.5 py-1 text-xs text-ink-soft"
                      >
                        {Array.from({ length: days }, (_, k) => (
                          <option key={k} value={k + 1}>Day {k + 1}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-1.5 flex items-center justify-end gap-0.5 text-ink-soft">
                      <IconButton label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)}><ArrowUp className="size-3.5" /></IconButton>
                      <IconButton label="Move down" disabled={i === stops.length - 1} onClick={() => move(i, i + 1)}><ArrowDown className="size-3.5" /></IconButton>
                      <IconButton
                        label="Remove stop"
                        onClick={() => onChange(stops.filter((x) => x.uid !== s.uid))}
                        className="hover:text-red-600"
                      >
                        <Trash2 className="size-3.5" />
                      </IconButton>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}

      <div className="flex gap-2">
        <button type="button" onClick={() => onDaysChange(Math.min(60, days + 1))} className="btn-outline btn-sm">
          <Plus className="size-4" /> Add day {days + 1}
        </button>
        {days > 1 && !stops.some((s) => s.day === days) && (
          <button type="button" onClick={() => onDaysChange(days - 1)} className="btn-ghost btn-sm">
            Remove empty day
          </button>
        )}
      </div>
    </div>
  );
}

function IconButton({
  label,
  children,
  onClick,
  disabled,
  className,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cn("inline-flex size-7 items-center justify-center rounded-lg hover:bg-fd-muted disabled:opacity-30", className)}
    >
      {children}
    </button>
  );
}

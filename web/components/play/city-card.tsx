import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { CitySummary } from "@/lib/play";
import { PlacePhoto } from "./place-photo";

/** A city's cover card: colours, emoji, tagline and progress. */
export function CityCard({ city, solved = 0, className }: { city: CitySummary; solved?: number; className?: string }) {
  const pct = city.lessons ? Math.round((solved / city.lessons) * 100) : 0;
  return (
    <Link
      href={`/play/${city.id}`}
      className={cn("group card flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-xl", className)}
    >
      <div className="relative h-44 overflow-hidden">
        <PlacePhoto photo={city.photo} width={500} emoji={city.emoji} colors={city.colors} alt={city.name} className="absolute inset-0" imgClassName="transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 35%, ${city.colors[0]}E6 100%)` }} />
        <span className="absolute left-3 top-3 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
          {city.lessons} levels · {city.freeLessons} free
        </span>
        <span className="absolute bottom-3 left-4 flex items-center gap-2 text-white">
          <span className="text-2xl drop-shadow">{city.emoji}</span>
          <span className="font-display text-2xl font-extrabold tracking-tight drop-shadow">{city.name}</span>
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">{city.country}</p>
        <p className="mt-1 flex-1 text-sm text-ink">{city.tagline}</p>
        {solved > 0 ? (
          <div className="mt-4">
            <div className="flex justify-between text-xs font-semibold"><span className="text-sunset">In progress</span><span className="text-ink-soft">{solved}/{city.lessons}</span></div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-fd-muted"><div className="h-full rounded-full bg-sunset" style={{ width: `${pct}%` }} /></div>
          </div>
        ) : (
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-sunset">
            Play {city.name} <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </span>
        )}
      </div>
    </Link>
  );
}

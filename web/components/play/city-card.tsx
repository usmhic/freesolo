import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { cityGradient, type CitySummary } from "@/lib/play";

/** A city's cover card: colours, emoji, tagline and progress. */
export function CityCard({ city, solved = 0, className }: { city: CitySummary; solved?: number; className?: string }) {
  const pct = city.lessons ? Math.round((solved / city.lessons) * 100) : 0;
  return (
    <Link
      href={`/play/${city.id}`}
      className={cn("group card flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-xl", className)}
    >
      <div className="relative h-36 overflow-hidden" style={{ background: cityGradient(city) }}>
        <svg aria-hidden className="absolute inset-0 size-full opacity-25" viewBox="0 0 300 140" preserveAspectRatio="none">
          <path d="M-10 120 C 60 60, 120 140, 190 80 S 280 30, 320 60" fill="none" stroke="#fff" strokeWidth="2.5" strokeDasharray="2 9" strokeLinecap="round" />
        </svg>
        <span className="absolute bottom-3 right-4 text-6xl drop-shadow-lg transition group-hover:scale-110">{city.emoji}</span>
        <span className="absolute left-4 top-4 rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
          {city.lessons} levels · {city.freeLessons} free
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">{city.country}</p>
        <h3 className="mt-1 font-display text-2xl font-extrabold tracking-tight">{city.name}</h3>
        <p className="mt-1 flex-1 text-sm text-ink-soft">{city.tagline}</p>
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

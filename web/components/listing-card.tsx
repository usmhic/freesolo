import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Route, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { coverGradient, money, parseRoute, tripDays, whenLabel, type Listing } from "@/lib/listings";
import { formatDistance } from "@/lib/routing";

/** Photo when the host uploaded one; otherwise a brand gradient with the listing's emoji. */
export function ListingCover({
  listing,
  className,
  emojiClassName,
  priority,
}: {
  listing: Pick<Listing, "id" | "title" | "emoji" | "coverImage">;
  className?: string;
  emojiClassName?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)} style={{ background: coverGradient(listing.id) }}>
      {listing.coverImage ? (
        <Image
          src={listing.coverImage}
          alt={listing.title}
          fill
          unoptimized
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      ) : (
        <>
          <svg aria-hidden className="absolute inset-0 size-full opacity-[0.16]" preserveAspectRatio="none" viewBox="0 0 400 250">
            <path d="M-10 210 C 80 150, 140 230, 220 160 S 360 90, 420 120" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />
            <path d="M-10 90 C 60 60, 130 120, 200 80 S 330 20, 420 40" fill="none" stroke="#fff" strokeWidth="1.5" />
          </svg>
          <span
            aria-hidden
            className={cn("absolute inset-0 flex items-center justify-center text-6xl drop-shadow-md", emojiClassName)}
          >
            {listing.emoji ?? "🧭"}
          </span>
        </>
      )}
    </div>
  );
}

export function SeatsMeter({ listing, className }: { listing: Listing; className?: string }) {
  const pct = Math.min(100, Math.round((listing.filledSeats / Math.max(1, listing.maxSeats)) * 100));
  const short = Math.max(0, listing.minSeats - listing.filledSeats);
  const full = listing.availableSeats <= 0;
  const nearlyFull = !full && listing.availableSeats <= 2;
  return (
    <div className={className}>
      <div className="h-1.5 overflow-hidden rounded-full bg-fd-muted">
        <div
          className={cn("h-full rounded-full", nearlyFull || full ? "bg-sunset-strong" : "bg-sunset")}
          style={{ width: `${Math.max(pct, 3)}%` }}
        />
      </div>
      <p className="mt-2 flex items-center justify-between text-xs text-ink-soft">
        <span className="inline-flex items-center gap-1">
          <Users className="size-3.5" /> {listing.filledSeats} of {listing.maxSeats} going
        </span>
        <span className={cn(nearlyFull && "font-semibold text-sunset-strong")}>
          {full
            ? "Group is full"
            : short > 0
              ? `${short} more to confirm`
              : nearlyFull
                ? `${listing.availableSeats} left`
                : "Confirmed"}
        </span>
      </p>
    </div>
  );
}

export function ListingCard({ listing, priority }: { listing: Listing; priority?: boolean }) {
  const trip = listing.kind === "trip";
  const days = trip ? tripDays(listing) : null;
  const route = parseRoute(listing.route);
  return (
    <Link
      href={`/trips/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-navy/10 focus-visible:outline-2 focus-visible:outline-sunset"
    >
      <div className="relative overflow-hidden">
        <ListingCover
          listing={listing}
          priority={priority}
          className="aspect-[4/3] transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-navy shadow-sm">
            {trip ? `${days ? `${days} days` : "Trip"}` : "Experience"}
          </span>
          {listing.joinPolicy === "approval" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-navy/85 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              <ShieldCheck className="size-3" /> Host picks
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-ink-soft">
            <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {listing.city}</span>
            <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" /> {whenLabel(listing)}</span>
            {route && (
              <span className="inline-flex items-center gap-1"><Route className="size-3.5" /> {formatDistance(route.distanceMeters)}</span>
            )}
          </p>
          <h3 className="mt-2 font-display text-lg font-bold leading-snug tracking-tight text-ink group-hover:text-sunset-strong">
            {listing.title}
          </h3>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2 text-sm text-ink-soft">
            <HostAvatar host={listing.host} size={26} />
            <span className="truncate">{listing.host.name ?? "A FreeSolo member"}</span>
          </span>
          <span className="shrink-0 text-right">
            <span className="font-display text-lg font-extrabold text-ink">{money(listing.price, listing.currency)}</span>
            <span className="block text-[11px] leading-none text-ink-soft">per person</span>
          </span>
        </div>

        <SeatsMeter listing={listing} />
      </div>
    </Link>
  );
}

export function HostAvatar({ host, size = 40 }: { host: Listing["host"]; size?: number }) {
  const initial = (host.name ?? "F")[0]?.toUpperCase();
  return host.image ? (
    <Image
      src={host.image}
      alt={host.name ?? "Host"}
      width={size}
      height={size}
      unoptimized
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-navy font-display font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initial}
    </span>
  );
}

export function EmptyListings({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-line bg-surface/60 px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-sunset-soft text-sunset">
        <Route className="size-6" />
      </span>
      <p className="max-w-md text-sm leading-relaxed text-ink-soft">{children}</p>
      {action}
    </div>
  );
}

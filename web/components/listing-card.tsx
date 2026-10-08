import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { coverGradient, money, tripDays, whenLabel, type Listing } from "@/lib/listings";

/** Photo when the host uploaded one; otherwise a gradient with the listing's emoji. */
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
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
              backgroundSize: "18px 18px",
            }}
          />
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 flex items-center justify-center text-6xl drop-shadow-sm",
              emojiClassName
            )}
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
      <div className="h-1.5 overflow-hidden rounded-full bg-fd-border">
        <div
          className={cn("h-full rounded-full transition-all", nearlyFull || full ? "bg-[#C2410C]" : "bg-[#B8976A]")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 flex items-center justify-between text-xs text-fd-muted-foreground">
        <span>
          {listing.filledSeats}/{listing.maxSeats} going
        </span>
        <span className={cn(nearlyFull && "font-medium text-[#C2410C]")}>
          {full
            ? "Group is full"
            : short > 0
              ? `${short} more to confirm`
              : nearlyFull
                ? `Only ${listing.availableSeats} left`
                : "Confirmed ✓"}
        </span>
      </p>
    </div>
  );
}

export function ListingCard({ listing, priority }: { listing: Listing; priority?: boolean }) {
  const trip = listing.kind === "trip";
  const days = trip ? tripDays(listing) : null;
  return (
    <Link
      href={`/trips/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-fd-border bg-fd-card transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/5"
    >
      <div className="relative">
        <ListingCover
          listing={listing}
          priority={priority}
          className="aspect-[16/10] transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
            {trip ? `Trip${days ? ` · ${days} days` : ""}` : "Experience"}
          </span>
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#0A0A0A] shadow-sm">
            {money(listing.price, listing.currency)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <CalendarDays className="size-3.5" /> {whenLabel(listing)}
            <span aria-hidden>·</span>
            <MapPin className="size-3.5" /> {listing.city}
          </p>
          <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug tracking-tight group-hover:underline group-hover:decoration-[#B8976A] group-hover:underline-offset-4">
            {listing.title}
          </h3>
        </div>

        <div className="mt-auto flex items-center gap-2 text-xs text-fd-muted-foreground">
          <HostAvatar host={listing.host} size={22} />
          <span className="truncate">Hosted by {listing.host.name ?? "a FreeSolo member"}</span>
          {listing.joinPolicy === "approval" && (
            <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-fd-muted px-2 py-0.5 font-medium text-fd-foreground">
              <ShieldCheck className="size-3" /> Host picks
            </span>
          )}
        </div>

        <SeatsMeter listing={listing} />
      </div>
    </Link>
  );
}

export function HostAvatar({
  host,
  size = 40,
}: {
  host: Listing["host"];
  size?: number;
}) {
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
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#B8976A] font-display font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {initial}
    </span>
  );
}

export function EmptyListings({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-fd-border px-6 py-16 text-center">
      <Users className="size-8 text-[#B8976A]" />
      <p className="max-w-md text-sm text-fd-muted-foreground">{children}</p>
    </div>
  );
}

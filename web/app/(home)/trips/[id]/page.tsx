import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  Lock,
  MapPin,
  MessagesSquare,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import {
  getListing,
  money,
  parseList,
  tripDays,
  whenLabel,
  type ItineraryDay,
  type Listing,
} from "@/lib/listings";
import { HostAvatar, ListingCover, SeatsMeter } from "@/components/listing-card";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListing((await params).id);
  if (!listing) return { title: "Trip not found" };
  return {
    title: listing.title,
    description: listing.description.slice(0, 160),
    openGraph: listing.coverImage ? { images: [listing.coverImage] } : undefined,
  };
}

export default async function TripPage({ params }: Props) {
  const listing = await getListing((await params).id);
  if (!listing || listing.status === "suspended") notFound();

  const trip = listing.kind === "trip";
  const days = trip ? tripDays(listing) : null;
  const itinerary = parseList<ItineraryDay>(listing.itinerary);
  const included = parseList(listing.included);
  const vetted = listing.joinPolicy === "approval";

  return (
    <div className="flex flex-1 flex-col pb-24 lg:pb-0">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 pt-6">
        <Link
          href={trip ? "/trips?kind=trip" : "/trips?kind=experience"}
          className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground hover:text-fd-foreground"
        >
          <ArrowLeft className="size-4" /> All {trip ? "trips" : "experiences"}
        </Link>

        <div className="relative mt-4 overflow-hidden rounded-3xl">
          <ListingCover
            listing={listing}
            priority
            className="aspect-[4/5] sm:aspect-[21/9]"
            emojiClassName="items-start pt-[18%] text-8xl sm:items-center sm:pt-0 sm:text-9xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
                {trip ? "Group trip" : "Experience"}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                {listing.category}
              </span>
            </div>
            <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              {listing.title}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/85">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" /> {whenLabel(listing)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" /> {listing.city}
              </span>
              {days ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" /> {days} days
                </span>
              ) : null}
            </p>
          </div>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-10">
          <Facts listing={listing} days={days} />

          <div>
            <SectionTitle>About this {trip ? "trip" : "experience"}</SectionTitle>
            <p className="whitespace-pre-line leading-relaxed text-fd-foreground/90">{listing.description}</p>
          </div>

          {itinerary.length > 0 && (
            <div>
              <SectionTitle>Day by day</SectionTitle>
              <ol className="relative space-y-6 border-l border-fd-border pl-8">
                {itinerary.map((day, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[45px] flex size-[26px] items-center justify-center rounded-full bg-fd-primary text-xs font-semibold text-fd-primary-foreground ring-4 ring-fd-background">
                      {i + 1}
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#B8976A]">Day {i + 1}</p>
                    <p className="mt-0.5 font-medium">{day.title}</p>
                    {day.description ? (
                      <p className="mt-1 text-sm leading-relaxed text-fd-muted-foreground">{day.description}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {included.length > 0 && (
            <div>
              <SectionTitle>What the price covers</SectionTitle>
              <ul className="grid gap-2 sm:grid-cols-2">
                {included.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 rounded-xl border border-fd-border bg-fd-card px-4 py-3 text-sm">
                    <Check className="size-4 shrink-0 text-[#6B8F71]" /> {item}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-fd-muted-foreground">
                FreeSolo never takes payment — you settle with the host directly.
              </p>
            </div>
          )}

          {listing.business && (
            <div>
              <SectionTitle>Venue</SectionTitle>
              <div className="flex items-start gap-3 rounded-xl border border-fd-border bg-fd-card p-4">
                <Store className="mt-0.5 size-5 text-[#B8976A]" />
                <div>
                  <p className="font-medium">{listing.business.name}</p>
                  <p className="text-sm text-fd-muted-foreground">
                    {listing.business.address}, {listing.business.city}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <SectionTitle>Your host</SectionTitle>
            <div className="flex items-center gap-4 rounded-2xl border border-fd-border bg-fd-card p-5">
              <HostAvatar host={listing.host} size={56} />
              <div>
                <p className="font-display text-lg font-semibold">{listing.host.name ?? "A FreeSolo member"}</p>
                <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground">
                  <ShieldCheck className="size-4 text-[#6B8F71]" /> Vetted member
                  {vetted ? " · reads every request personally" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Join card ─────────────────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-fd-border bg-fd-card p-6 shadow-sm">
            <p className="flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-bold">{money(listing.price, listing.currency)}</span>
              <span className="text-sm text-fd-muted-foreground">per person</span>
            </p>
            <p className="mt-1 text-sm text-fd-muted-foreground">{whenLabel(listing)}</p>

            <SeatsMeter listing={listing} className="mt-5" />

            <ul className="mt-5 space-y-2.5 text-sm">
              <li className="flex items-start gap-2.5">
                <Users className="mt-0.5 size-4 shrink-0 text-[#B8976A]" />
                {listing.minSeats}–{listing.maxSeats} travelers. It confirms for everyone once {listing.minSeats} are in.
              </li>
              {vetted && (
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#B8976A]" />
                  You ask to join with a short intro; the host picks the group.
                </li>
              )}
              <li className="flex items-start gap-2.5">
                <MessagesSquare className="mt-0.5 size-4 shrink-0 text-[#B8976A]" />
                A private group chat opens once you have a place.
              </li>
              <li className="flex items-start gap-2.5">
                <Lock className="mt-0.5 size-4 shrink-0 text-[#B8976A]" />
                Who&apos;s going is visible to members only.
              </li>
            </ul>

            <Link
              href="/apply"
              className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl bg-fd-primary px-4 py-3 text-sm font-semibold text-fd-primary-foreground hover:opacity-90"
            >
              Apply to join FreeSolo <ArrowRight className="size-4" />
            </Link>
            <p className="mt-3 text-center text-xs leading-relaxed text-fd-muted-foreground">
              Already a member? Open the FreeSolo app — you&apos;ll find this under{" "}
              {trip ? "Trips" : "Experiences"} in your feed.
            </p>
          </div>
        </aside>
      </section>

      {/* ── Phone: price and action always in reach ───────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-fd-border bg-fd-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0">
            <p className="font-display text-xl font-bold leading-none">{money(listing.price, listing.currency)}</p>
            <p className="mt-1 truncate text-xs text-fd-muted-foreground">
              {listing.availableSeats > 0 ? `${listing.availableSeats} places left` : "Group is full"} · {whenLabel(listing)}
            </p>
          </div>
          <Link
            href="/apply"
            className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-fd-primary px-4 py-2.5 text-sm font-semibold text-fd-primary-foreground"
          >
            Apply to join <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 font-display text-xl font-semibold tracking-tight">{children}</h2>;
}

function Facts({ listing, days }: { listing: Listing; days: number | null }) {
  const facts = [
    { label: listing.kind === "trip" ? "Dates" : "When", value: whenLabel(listing) },
    days ? { label: "Length", value: `${days} days` } : { label: "Duration", value: `${Math.round(listing.durationMins / 6) / 10} h` },
    { label: "Group", value: `${listing.minSeats}–${listing.maxSeats} people` },
    { label: "Meet at", value: listing.time },
  ];
  return (
    <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-fd-border bg-fd-card sm:grid-cols-4">
      {facts.map((f, i) => (
        <div
          key={f.label}
          className={`px-5 py-4 ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t sm:border-t-0" : ""} ${i === 2 ? "sm:border-l" : ""} border-fd-border`}
        >
          <dt className="text-xs uppercase tracking-wide text-fd-muted-foreground">{f.label}</dt>
          <dd className="mt-1 font-medium">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

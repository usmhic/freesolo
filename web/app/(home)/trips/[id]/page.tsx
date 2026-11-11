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
  Route,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import {
  getListing,
  money,
  parseList,
  parseRoute,
  tripDays,
  whenLabel,
  type ItineraryDay,
  type Listing,
} from "@/lib/listings";
import { formatDistance, formatDuration, modeLabel } from "@/lib/routing";
import { HostAvatar, ListingCover, SeatsMeter } from "@/components/listing-card";
import { TripRouteMap } from "./trip-route-map";

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
  const route = parseRoute(listing.route);
  const vetted = listing.joinPolicy === "approval";

  return (
    <div className="pb-28 lg:pb-0">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="container-page pt-6">
        <Link
          href={trip ? "/trips?kind=trip" : "/trips?kind=experience"}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
        >
          <ArrowLeft className="size-4" /> All {trip ? "trips" : "experiences"}
        </Link>

        <div className="relative mt-4 overflow-hidden rounded-[2rem]">
          <ListingCover
            listing={listing}
            priority
            className="aspect-[4/5] sm:aspect-[21/9]"
            emojiClassName="items-start pt-[18%] text-8xl sm:items-center sm:pt-0 sm:text-9xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-sunset px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {trip ? "Group trip" : "Experience"}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                {listing.category}
              </span>
            </div>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              {listing.title}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/85">
              <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" /> {whenLabel(listing)}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" /> {listing.city}</span>
              {days ? <span className="inline-flex items-center gap-1.5"><Clock className="size-4" /> {days} days</span> : null}
              {route ? (
                <span className="inline-flex items-center gap-1.5"><Route className="size-4" /> {formatDistance(route.distanceMeters)}</span>
              ) : null}
            </p>
          </div>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <section className="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
        <div className="min-w-0 space-y-12">
          <Facts listing={listing} days={days} />

          <div>
            <SectionTitle>About this {trip ? "trip" : "experience"}</SectionTitle>
            <p className="whitespace-pre-line text-[17px] leading-relaxed text-ink/90">{listing.description}</p>
          </div>

          {route && (
            <div>
              <SectionTitle>The route</SectionTitle>
              <div className="card overflow-hidden">
                <div className="h-[320px] sm:h-[400px]">
                  <TripRouteMap route={route} />
                </div>
                <div className="grid gap-px bg-line sm:grid-cols-3">
                  {[
                    ["Distance", formatDistance(route.distanceMeters)],
                    [route.estimated ? "Time (estimate)" : "Travel time", formatDuration(route.durationSeconds)],
                    ["Mode", modeLabel(route.profile)],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-surface px-5 py-4">
                      <p className="text-xs uppercase tracking-wide text-ink-soft">{k}</p>
                      <p className="mt-1 font-display text-lg font-bold">{v}</p>
                    </div>
                  ))}
                </div>
                <ol className="divide-y divide-line border-t border-line">
                  {route.stops.map((s, i) => (
                    <li key={`${s.name}-${i}`} className="flex items-center gap-4 px-5 py-3.5">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white dark:bg-sunset">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{s.name}</span>
                        {s.day ? <span className="text-xs text-ink-soft">Day {s.day}</span> : null}
                      </span>
                      {i > 0 && route.legs[i - 1] ? (
                        <span className="shrink-0 text-right text-xs text-ink-soft">
                          {formatDistance(route.legs[i - 1].distanceMeters)}
                          <br />
                          {formatDuration(route.legs[i - 1].durationSeconds)}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ol>
                {route.estimated && (
                  <p className="border-t border-line px-5 py-3 text-xs text-ink-soft">
                    Distances are straight-line estimates between stops.
                  </p>
                )}
              </div>
            </div>
          )}

          {itinerary.length > 0 && (
            <div>
              <SectionTitle>Day by day</SectionTitle>
              <ol className="relative space-y-7 border-l-2 border-dashed border-line pl-8">
                {itinerary.map((day, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[47px] flex size-8 items-center justify-center rounded-full bg-sunset text-xs font-bold text-white ring-4 ring-paper">
                      {i + 1}
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-wide text-sunset">Day {i + 1}</p>
                    <p className="mt-1 font-display text-lg font-bold">{day.title}</p>
                    {day.description ? (
                      <p className="mt-1 leading-relaxed text-ink-soft">{day.description}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {included.length > 0 && (
            <div>
              <SectionTitle>What the price covers</SectionTitle>
              <ul className="grid gap-3 sm:grid-cols-2">
                {included.map((item) => (
                  <li key={item} className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 text-sm font-medium">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sage">
                      <Check className="size-3.5" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-ink-soft">FreeSolo never takes payment — you settle with the host directly.</p>
            </div>
          )}

          {listing.business && (
            <div>
              <SectionTitle>Venue</SectionTitle>
              <div className="card flex items-start gap-4 p-5">
                <Store className="mt-0.5 size-5 text-sunset" />
                <div>
                  <p className="font-semibold">{listing.business.name}</p>
                  <p className="text-sm text-ink-soft">{listing.business.address}, {listing.business.city}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <SectionTitle>Your host</SectionTitle>
            <div className="card flex items-center gap-4 p-6">
              <HostAvatar host={listing.host} size={60} />
              <div>
                <p className="font-display text-xl font-bold">{listing.host.name ?? "A FreeSolo member"}</p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-soft">
                  <ShieldCheck className="size-4 text-sage" /> Vetted member
                  {vetted ? " · reads every request personally" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Join card ─────────────────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6 shadow-xl shadow-navy/5">
            <p className="flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-extrabold">{money(listing.price, listing.currency)}</span>
              <span className="text-sm text-ink-soft">per person</span>
            </p>
            <p className="mt-1 text-sm text-ink-soft">{whenLabel(listing)}</p>

            <SeatsMeter listing={listing} className="mt-5" />

            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex gap-3">
                <Users className="mt-0.5 size-4 shrink-0 text-sunset" />
                {listing.minSeats}–{listing.maxSeats} travelers. It confirms for everyone once {listing.minSeats} are in.
              </li>
              {vetted && (
                <li className="flex gap-3">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sunset" />
                  Ask to join with a short intro; the host picks the group.
                </li>
              )}
              <li className="flex gap-3">
                <MessagesSquare className="mt-0.5 size-4 shrink-0 text-sunset" />
                A private group chat opens once you have a place.
              </li>
              <li className="flex gap-3">
                <Lock className="mt-0.5 size-4 shrink-0 text-sunset" />
                Who&apos;s going is visible to members only.
              </li>
            </ul>

            <Link href="/apply" className="btn-primary mt-6 w-full py-3">
              Apply to join FreeSolo <ArrowRight className="size-4" />
            </Link>
            <p className="mt-3 text-center text-xs leading-relaxed text-ink-soft">
              Already a member? Open the FreeSolo app — it&apos;s under {trip ? "Trips" : "Experiences"} in your feed.
            </p>
          </div>
        </aside>
      </section>

      {/* ── Phone: price and action always in reach ─────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0">
            <p className="font-display text-xl font-extrabold leading-none">{money(listing.price, listing.currency)}</p>
            <p className="mt-1 truncate text-xs text-ink-soft">
              {listing.availableSeats > 0 ? `${listing.availableSeats} places left` : "Group is full"} · {whenLabel(listing)}
            </p>
          </div>
          <Link href="/apply" className="btn-primary ml-auto shrink-0">
            Apply to join <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-5 font-display text-2xl font-extrabold tracking-tight">{children}</h2>;
}

function Facts({ listing, days }: { listing: Listing; days: number | null }) {
  const facts = [
    { label: listing.kind === "trip" ? "Dates" : "When", value: whenLabel(listing) },
    days
      ? { label: "Length", value: `${days} days` }
      : { label: "Duration", value: `${Math.round(listing.durationMins / 6) / 10} h` },
    { label: "Group", value: `${listing.minSeats}–${listing.maxSeats} people` },
    { label: "Meet at", value: listing.time },
  ];
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-4">
      {facts.map((f) => (
        <div key={f.label} className="bg-surface px-5 py-4">
          <dt className="text-xs uppercase tracking-wide text-ink-soft">{f.label}</dt>
          <dd className="mt-1 font-display font-bold">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Map, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { getListings, type ListingKind } from "@/lib/listings";
import { EmptyListings, ListingCard } from "@/components/listing-card";

export const metadata: Metadata = {
  title: "Group trips & experiences",
  description:
    "Small-group trips and local experiences hosted by vetted FreeSolo members. Browse what's coming up, then ask to join from the app.",
};

const KINDS: { id: "all" | ListingKind; label: string; heading: string }[] = [
  { id: "all", label: "Everything", heading: "Trips & experiences" },
  { id: "trip", label: "Group trips", heading: "Group trips" },
  { id: "experience", label: "Experiences", heading: "Local experiences" },
];

function href(kind: string, q: string) {
  const p = new URLSearchParams();
  if (kind !== "all") p.set("kind", kind);
  if (q) p.set("q", q);
  const s = p.toString();
  return s ? `/trips?${s}` : "/trips";
}

export default async function TripsPage({ searchParams }: { searchParams: Promise<{ kind?: string; q?: string }> }) {
  const { kind, q: rawQ } = await searchParams;
  const active = KINDS.find((k) => k.id === kind) ?? KINDS[0];
  const q = (rawQ ?? "").trim().slice(0, 80);
  const listings = await getListings({
    kind: active.id === "all" ? undefined : active.id,
    city: q || undefined,
    limit: 48,
  });

  return (
    <>
      <section className="border-b border-line">
        <div className="container-page pb-8 pt-10 sm:pt-14">
          <p className="eyebrow">Leaving soon</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{active.heading}</h1>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Hosted by vetted members and capped at twelve travelers. Members ask to join from the app — on
            most trips, the host picks the group.
          </p>

          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <form action="/trips" className="relative w-full max-w-md" role="search">
              {active.id !== "all" && <input type="hidden" name="kind" value={active.id} />}
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search a city or region"
                aria-label="Search by city or region"
                className="field h-12 rounded-full pl-11 pr-28"
              />
              <button type="submit" className="btn-dark btn-sm absolute right-1.5 top-1/2 -translate-y-1/2">
                Search
              </button>
            </form>

            <nav aria-label="Filter listings" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
              {KINDS.map((k) => (
                <Link
                  key={k.id}
                  href={href(k.id, q)}
                  aria-current={k.id === active.id ? "page" : undefined}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
                    k.id === active.id
                      ? "border-navy bg-navy text-white dark:border-ink dark:bg-ink dark:text-navy-deep"
                      : "border-line bg-surface text-ink-soft hover:text-ink"
                  )}
                >
                  {k.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-soft">
            {listings.length} {listings.length === 1 ? "listing" : "listings"}
            {q && (
              <>
                {" "}matching <span className="font-semibold text-ink">“{q}”</span>{" "}
                <Link href={href(active.id, "")} className="ml-1 inline-flex items-center gap-1 text-sunset hover:underline">
                  <X className="size-3.5" /> clear
                </Link>
              </>
            )}
          </p>
          <Link href="/planner" className="btn-ghost btn-sm">
            <Map className="size-4" /> Plan your own route
          </Link>
        </div>

        {listings.length === 0 ? (
          <EmptyListings
            action={
              <Link href="/planner" className="btn-outline btn-sm">
                Sketch a route instead <ArrowRight className="size-4" />
              </Link>
            }
          >
            {q
              ? `Nothing open around “${q}” right now. Try a nearby city, or check back — new trips are posted every week.`
              : "Nothing open right now — new trips are posted every week. Members can host their own from the app."}
          </EmptyListings>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l, i) => (
              <ListingCard key={l.id} listing={l} priority={i < 3} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

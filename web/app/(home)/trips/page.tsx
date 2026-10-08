import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { getListings, type ListingKind } from "@/lib/listings";
import { EmptyListings, ListingCard } from "@/components/listing-card";

export const metadata: Metadata = {
  title: "Group trips & experiences",
  description:
    "Small-group trips and local experiences hosted by vetted FreeSolo members. Browse what's coming up, then ask to join from the app.",
};

const TABS: { id: "all" | ListingKind; label: string; heading: string }[] = [
  { id: "all", label: "Everything", heading: "Trips & experiences" },
  { id: "trip", label: "Group trips", heading: "Group trips" },
  { id: "experience", label: "Experiences", heading: "Local experiences" },
];

export default async function TripsPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  const active = TABS.find((t) => t.id === kind) ?? TABS[0];
  const listings = await getListings({ kind: active.id === "all" ? undefined : active.id, limit: 48 });

  return (
    <div className="flex flex-1 flex-col">
      <section className="border-b border-fd-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-10 pt-16 sm:pt-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B8976A]">Leaving soon</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">{active.heading}</h1>
            <p className="mt-4 text-fd-muted-foreground">
              Every listing is hosted by a vetted member and capped at twelve travelers. Only approved
              members can see who&apos;s going or ask to join — on most trips, the host picks the group.
            </p>
          </div>

          <nav aria-label="Filter listings" className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <Link
                key={t.id}
                href={t.id === "all" ? "/trips" : `/trips?kind=${t.id}`}
                aria-current={t.id === active.id ? "page" : undefined}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  t.id === active.id
                    ? "border-fd-primary bg-fd-primary text-fd-primary-foreground"
                    : "border-fd-border bg-fd-card hover:bg-fd-accent"
                )}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        {listings.length === 0 ? (
          <EmptyListings>
            Nothing open right now — new {active.id === "experience" ? "experiences" : "trips"} are posted
            every week. Members can host their own from the app.
          </EmptyListings>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l, i) => (
              <ListingCard key={l.id} listing={l} priority={i < 3} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-fd-border bg-fd-card/40">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#B8976A]" />
            <p className="max-w-xl text-sm text-fd-muted-foreground">
              FreeSolo is invite-gated. A person reads every application — usually within 48 hours —
              and once you&apos;re in, you can ask to join any of these from the app.
            </p>
          </div>
          <Link
            href="/apply"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground hover:opacity-90"
          >
            Apply to join <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

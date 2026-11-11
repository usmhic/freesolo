import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  ChevronDown,
  HandCoins,
  Map,
  MessagesSquare,
  Route,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { HeroRoute } from "@/components/site/hero-route";
import { PlannerPreview } from "@/components/site/planner-preview";
import { getListings } from "@/lib/listings";

export const metadata: Metadata = {
  title: "FreeSolo — small-group trips for solo travelers",
  description:
    "Join small, vetted groups of solo travelers on trips hosted by members, or plan your own route on the map. Apply to join — a person reads every application.",
};

// Live "Leaving soon" trips: re-fetched at most once a minute. Next.js needs a
// literal here; keep it in step with LISTINGS_REVALIDATE_SECONDS.
export const revalidate = 60;

const STEPS = [
  {
    icon: UserRoundCheck,
    title: "Apply once",
    body: "Tell us a little about how you travel. A real person reads every application, usually within 48 hours.",
  },
  {
    icon: Users,
    title: "Find your group",
    body: "Browse trips members are hosting. Ask to join with a short intro — on most trips the host picks the group.",
  },
  {
    icon: Route,
    title: "Plan the route",
    body: "Lay out stops on the map, see real road and trail times, and keep every plan in one place.",
  },
  {
    icon: MessagesSquare,
    title: "Go together",
    body: "Once you have a place, the group chat opens. Sort meeting points and rooms, then go.",
  },
];

const PROMISES = [
  {
    icon: BadgeCheck,
    title: "Everyone was vetted",
    body: "Membership is by application only. No anonymous profiles, no open sign-ups.",
  },
  {
    icon: Users,
    title: "Twelve at most",
    body: "Groups cap at twelve and most run four to eight — small enough to actually talk to everyone.",
  },
  {
    icon: ShieldCheck,
    title: "The host picks",
    body: "On most trips the host reads every request. You see who's going before you commit.",
  },
  {
    icon: HandCoins,
    title: "No fees, ever",
    body: "FreeSolo never takes payment. You settle with the host directly, and only once the group is set.",
  },
];

const FAQ = [
  {
    q: "Who is FreeSolo for?",
    a: "People who like to travel alone but don't always want to do everything by themselves. Members join small trips and local experiences hosted by other members.",
  },
  {
    q: "Why do I have to apply?",
    a: "Because the group is the product. A person reads every application so that everyone on a trip has been looked at by a human — it's slower than an open marketplace, on purpose.",
  },
  {
    q: "How does joining a trip work?",
    a: "Open a trip, ask to join with a short intro, and wait for the host. Once you're accepted you hold a place, and the trip confirms for everyone when enough travelers are in.",
  },
  {
    q: "Do I need an account to use the planner?",
    a: "No — anyone can sketch a route. Sign in to save plans to your account, and if you host a trip you can show your route on its page.",
  },
  {
    q: "What does it cost?",
    a: "Nothing. FreeSolo doesn't take payment or commission. Each trip shows what the host charges and what it covers.",
  },
];

export default async function HomePage() {
  const trips = (await getListings({ kind: "trip", limit: 6 })).slice(0, 6);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 size-[640px] rounded-full bg-sunset/10 blur-3xl dark:bg-sunset/[0.07]"
        />
        <div className="container-page grid items-center gap-12 pb-16 pt-10 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft">
              <span className="size-1.5 rounded-full bg-sunset" />
              Invite-only · groups of up to 12 · no fees
            </span>
            <h1 className="mt-6 font-display text-[2.6rem] font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-[4.1rem]">
              Travel solo.
              <br />
              <span className="text-sunset">Never alone.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              Join small groups of vetted solo travelers on trips hosted by members — or plan your own
              route on the map, with real road and trail times for every leg.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/trips" className="btn-primary px-6 py-3 text-[15px]">
                Explore trips <ArrowRight className="size-4" />
              </Link>
              <Link href="/planner" className="btn-outline px-6 py-3 text-[15px]">
                <Map className="size-4" /> Plan a route
              </Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
              {[
                ["100%", "members vetted"],
                ["≤ 12", "per group"],
                ["€0", "booking fees"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-display text-2xl font-extrabold text-ink">{v}</dd>
                  <dd className="text-xs text-ink-soft">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <HeroRoute />
        </div>
      </section>

      {/* ── Leaving soon (live) ──────────────────────────────────────────── */}
      <section className="border-t border-line bg-surface/50 py-20">
        <div className="container-page">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <p className="eyebrow">Leaving soon</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Trips members are hosting
              </h2>
              <p className="mt-3 text-ink-soft">
                Planned by a member, joined by a handful of vetted solo travelers.
              </p>
            </div>
            <Link href="/trips" className="btn-outline">
              See all trips <ArrowRight className="size-4" />
            </Link>
          </div>

          {trips.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((t, i) => (
                <ListingCard key={t.id} listing={t} priority={i < 2} />
              ))}
            </div>
          ) : (
            <div className="mt-10 grid gap-6 rounded-3xl border border-dashed border-line p-10 text-center">
              <p className="text-ink-soft">
                New trips are posted every week. Members can host their own from the app — or start by{" "}
                <Link href="/planner" className="font-semibold text-sunset hover:underline">planning a route</Link>.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-24">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              From stranger to fellow traveler
            </h2>
          </div>
          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="card relative p-6">
                <span className="absolute right-5 top-5 font-display text-sm font-bold text-ink-soft/50">
                  0{i + 1}
                </span>
                <span className="flex size-11 items-center justify-center rounded-2xl bg-sunset-soft text-sunset">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Planner ──────────────────────────────────────────────────────── */}
      <section className="bg-navy py-20 text-white sm:py-24 dark:bg-navy-deep">
        <div className="container-page grid items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sunset">Trip planner</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Lay out the whole journey on one map
            </h2>
            <p className="mt-4 text-white/75">
              Search places, drop stops, drag them into order and split them into days. FreeSolo works
              out the road, bike or trail route between every stop — with distance and time for each leg.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-white/85">
              {[
                "Drive, cycle, walk or hike — switch modes and the route follows",
                "Group stops into days and see each day's distance at a glance",
                "Save plans to your account and pick them up on any device",
                "Hosting? Put your route on your trip so travelers see where you're going",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <CalendarCheck className="mt-0.5 size-4 shrink-0 text-sunset" /> {t}
                </li>
              ))}
            </ul>
            <Link href="/planner" className="btn-primary mt-9 px-6 py-3">
              Open the planner <ArrowRight className="size-4" />
            </Link>
          </div>
          <PlannerPreview />
        </div>
      </section>

      {/* ── Promises ─────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Why it feels different</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Built around who else turns up
            </h2>
            <p className="mt-4 text-ink-soft">
              The itinerary matters less than the people. So FreeSolo is slow to join, small by design,
              and never in the middle of your money.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROMISES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="card p-6">
                <Icon className="size-6 text-sunset" />
                <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Host + FAQ ───────────────────────────────────────────────────── */}
      <section className="border-t border-line bg-surface/50 py-20 sm:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="card overflow-hidden">
              <div className="bg-sunset-soft p-8">
                <Sparkles className="size-6 text-sunset" />
                <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Planning a trip anyway? Host it.
                </h2>
                <p className="mt-3 text-ink-soft">
                  Publish your itinerary and route, read every request, and choose the solo travelers who
                  come with you. Approved members can host from the FreeSolo app.
                </p>
              </div>
              <div className="flex flex-col gap-3 p-6 sm:flex-row">
                <Link href="/apply" className="btn-primary">Apply to join <ArrowRight className="size-4" /></Link>
                <Link href="/docs/trips#hosting-a-trip" className="btn-ghost">How hosting works</Link>
              </div>
            </div>
          </div>

          <div>
            <p className="eyebrow">Questions</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight">Good to know</h2>
            <div className="mt-8 divide-y divide-line border-y border-line">
              {FAQ.map(({ q, a }) => (
                <details key={q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    {q}
                    <ChevronDown className="size-5 shrink-0 text-ink-soft transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[2rem] bg-sunset px-6 py-14 text-center text-white sm:px-12">
            <svg aria-hidden className="absolute inset-0 size-full opacity-20" viewBox="0 0 800 300" preserveAspectRatio="none">
              <path d="M-20 260 C 160 160, 300 300, 460 180 S 700 60, 820 120" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="3 14" strokeLinecap="round" />
            </svg>
            <h2 className="relative font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
              Your next trip is already forming.
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-white/90">
              Applications take about five minutes, and a person reads every one.
            </p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/apply" className="btn bg-white px-6 py-3 text-navy hover:bg-white/90">
                Apply to join <ArrowRight className="size-4" />
              </Link>
              <Link href="/apply/status" className="btn border border-white/50 px-6 py-3 text-white hover:bg-white/10">
                Check my application
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

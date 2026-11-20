import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpenCheck,
  Camera,
  ChevronDown,
  Footprints,
  Library,
  MapPinned,
  ScrollText,
  Sparkles,
  Users,
} from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { LessonPreview } from "@/components/site/lesson-preview";
import { StarOrb } from "@/components/play/star-badge";
import { CityCard } from "@/components/play/city-card";
import { getPlayCities } from "@/lib/play-server";
import { getListings } from "@/lib/listings";

export const metadata: Metadata = {
  title: "FreeSolo — a history game for the city you're in",
  description:
    "Tell FreeSolo where you're travelling and play the city: short history lessons you solve on the spot, checked by AI, with every fact sourced. Earn stardust, climb from Nebula to Black Hole, and meet other travelers.",
};

// Live group trips: re-fetched at most once a minute. Next.js needs a
// literal here; keep it in step with LISTINGS_REVALIDATE_SECONDS.
export const revalidate = 60;

const STEPS = [
  {
    icon: MapPinned,
    title: "Tell us where",
    body: "Pick your city and how many days you're there. That's the whole setup.",
  },
  {
    icon: Footprints,
    title: "Get your journey",
    body: "Your city becomes a walk of levels, in a sensible order, split across your days.",
  },
  {
    icon: Camera,
    title: "Solve on the spot",
    body: "Each level asks you to look closely at the real place. Type what you found or snap a photo.",
  },
  {
    icon: Sparkles,
    title: "Learn & light a star",
    body: "Get it right and the story unlocks — plus stardust, and a new star in your sky.",
  },
];

const RANKS = [
  ["nebula", "Nebula"],
  ["protostar", "Protostar"],
  ["white-dwarf", "White Dwarf"],
  ["red-giant", "Red Giant"],
  ["blue-giant", "Blue Giant"],
  ["supernova", "Supernova"],
  ["black-hole", "Black Hole"],
] as const;

const PROMISES = [
  {
    icon: MapPinned,
    title: "Learn where it happened",
    body: "Every lesson is tied to a place you're standing in front of. You can't solve it from the sofa.",
  },
  {
    icon: Library,
    title: "Facts you can check",
    body: "Lessons are written from real sources, and every story links to them. No made-up history.",
  },
  {
    icon: BookOpenCheck,
    title: "Fair, friendly checking",
    body: "AI reads your answer like a good teacher would: typos, other languages and your own words all count.",
  },
  {
    icon: Users,
    title: "Never explore alone",
    body: "Want company? Join a small group trip with vetted solo travelers who love this stuff too.",
  },
];

const FAQ = [
  {
    q: "What is FreeSolo?",
    a: "A history game for travelers. Tell it where you are, and it turns the city into short levels: look closely at a real place, answer a challenge, and unlock the story behind it.",
  },
  {
    q: "What does it cost?",
    a: "The first levels in every city are free, with no account needed. A city pack unlocks the rest of that city for good — and packs are free while we're in pilot.",
  },
  {
    q: "How are my answers checked?",
    a: "Simple answers are matched straight away. Where AI checking is switched on, it also accepts your own wording, other languages and photos of what you found — and nudges you when you're close.",
  },
  {
    q: "Is the history accurate?",
    a: "Each lesson is written from published sources and links to them, so you can read more. If you spot a mistake, tell us and we'll fix it.",
  },
  {
    q: "What are the star ranks?",
    a: "Your rank as a player, from Nebula to Black Hole. You climb by earning stardust in any city. Ranks are never for sale — they only mean something because they're earned.",
  },
];

export default async function HomePage() {
  const [trips, cities] = await Promise.all([
    getListings({ kind: "trip", limit: 6 }).then((t) => t.slice(0, 6)),
    getPlayCities(),
  ]);

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
              A history game for travelers · free to start
            </span>
            <h1 className="mt-6 font-display text-[2.6rem] font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-[4.1rem]">
              Every street
              <br />
              has a story.
              <br />
              <span className="text-sunset">Play it.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              Tell us where you&apos;re travelling and FreeSolo turns the city into short history levels you
              solve on the spot. Learn what really happened there, earn stardust, and watch your sky fill up.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/play" className="btn-primary px-6 py-3 text-[15px]">
                Start playing <ArrowRight className="size-4" />
              </Link>
              <Link href="#how-it-works" className="btn-outline px-6 py-3 text-[15px]">
                <ScrollText className="size-4" /> How it works
              </Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
              {[
                ["10 min", "per level"],
                ["100%", "facts sourced"],
                ["Free", "first levels"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-display text-2xl font-extrabold text-ink">{v}</dd>
                  <dd className="text-xs text-ink-soft">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <LessonPreview />
        </div>
      </section>

      {/* ── Cities ───────────────────────────────────────────────────────── */}
      {cities.length > 0 && (
        <section className="border-t border-line bg-surface/50 py-20">
          <div className="container-page">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div className="max-w-xl">
                <p className="eyebrow">Pick your city</p>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {cities.length} cities, {cities.reduce((n, c) => n + c.lessons, 0)} levels of real history
                </h2>
                <p className="mt-3 text-ink-soft">The first three levels in every city are free. No account needed.</p>
              </div>
              <Link href="/play" className="btn-outline">All cities <ArrowRight className="size-4" /></Link>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {cities.map((c) => <CityCard key={c.id} city={c} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-24">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              From “where am I?” to “I know this place”
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

      {/* ── Star ladder ──────────────────────────────────────────────────── */}
      <section className="bg-navy py-20 text-white sm:py-24 dark:bg-navy-deep">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sunset">Your rank</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              From Nebula to Black Hole
            </h2>
            <p className="mt-4 text-white/75">
              Every level you solve earns stardust, in any city. Collect enough and your star evolves.
              Ranks are earned, never bought — so when you meet another player, it means something.
            </p>
          </div>
          <ol className="mt-12 flex snap-x gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-7 lg:overflow-visible">
            {RANKS.map(([key, name], i) => (
              <li key={key} className="flex min-w-32 snap-start flex-col items-center rounded-3xl border border-white/10 bg-white/5 px-3 py-6 text-center">
                <StarOrb rankKey={key} size={44 + i * 4} />
                <span className="mt-4 font-display font-bold">{name}</span>
                <span className="mt-1 text-xs text-white/60">Rank {i + 1}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/play" className="btn-primary px-6 py-3">
              Earn your first stardust <ArrowRight className="size-4" />
            </Link>
            <Link href="/sky" className="btn border border-white/30 px-6 py-3 text-white hover:bg-white/10">
              <Sparkles className="size-4" /> See my sky
            </Link>
          </div>
        </div>
      </section>

      {/* ── Promises ─────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Why it works</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Learning that feels like exploring
            </h2>
            <p className="mt-4 text-ink-soft">
              Guidebooks tell you. Tours walk you past. FreeSolo makes you look — and that&apos;s what
              you remember.
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

      {/* ── Group trips (live) ───────────────────────────────────────────── */}
      <section className="border-t border-line bg-surface/50 py-20">
        <div className="container-page">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <p className="eyebrow">Play together</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Prefer company? Join a group trip
              </h2>
              <p className="mt-3 text-ink-soft">
                Small groups of vetted solo travelers, hosted by members who know the place.
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
                New trips are posted every week. In the meantime, the city is yours —{" "}
                <Link href="/play" className="font-semibold text-sunset hover:underline">start playing</Link>.
              </p>
            </div>
          )}
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
                  Know a city by heart? Host a trip.
                </h2>
                <p className="mt-3 text-ink-soft">
                  Take a small group of vetted solo travelers through the places you love. Publish your
                  route, read every request, and choose who comes. Approved members host from the app.
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
              Your city is waiting.
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-white/90">
              The first levels are free and need no account. Pick a city and go.
            </p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/play" className="btn bg-white px-6 py-3 text-navy hover:bg-white/90">
                Start playing <ArrowRight className="size-4" />
              </Link>
              <Link href="/apply" className="btn border border-white/50 px-6 py-3 text-white hover:bg-white/10">
                Join the community
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

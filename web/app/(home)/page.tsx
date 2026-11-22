import Link from "next/link";
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
import { CityCard } from "@/components/play/city-card";
import { StarOrb } from "@/components/play/star-badge";
import { LessonPreview } from "@/components/site/lesson-preview";
import { fill } from "@/lib/i18n/config";
import { getDictionary, getLang } from "@/lib/i18n/server";
import { getListings } from "@/lib/listings";
import { getPlayCities } from "@/lib/play-server";
import { SectionHeading } from "@/components/site/section-heading";

// Live cities and trips: re-fetched at most once a minute. Next.js needs a
// literal here; keep it in step with PUBLIC_REVALIDATE_SECONDS.
export const revalidate = 60;

const STEP_ICONS = [MapPinned, Footprints, Camera, Sparkles];
const WHY_ICONS = [MapPinned, Library, BookOpenCheck, Users];
const RANK_KEYS = ["nebula", "protostar", "white-dwarf", "red-giant", "blue-giant", "supernova", "black-hole"] as const;

export default async function HomePage() {
  const lang = await getLang();
  const dict = await getDictionary(lang);
  const t = dict.home;
  const [trips, cities] = await Promise.all([
    getListings({ kind: "trip", limit: 6 }).then((l) => l.slice(0, 6)),
    getPlayCities(lang),
  ]);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -end-40 -top-40 size-[640px] rounded-full bg-sunset/10 blur-3xl dark:bg-sunset/[0.07]" />
        <div className="container-page grid items-center gap-12 pb-16 pt-10 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft">
              <span className="size-1.5 rounded-full bg-sunset" />
              {t.badge}
            </span>
            <h1 className="mt-6 font-display text-[2.6rem] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-6xl lg:text-[4.1rem]">
              {t.h1a}
              <br />
              {t.h1b}
              <br />
              <span className="text-sunset">{t.h1c}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">{t.lead}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/play" className="btn-primary px-6 py-3 text-[15px]">
                {t.start} <ArrowRight className="size-4" />
              </Link>
              <Link href="#how-it-works" className="btn-outline px-6 py-3 text-[15px]">
                <ScrollText className="size-4" /> {t.how}
              </Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
              {t.stats.map(([v, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-display text-2xl font-extrabold text-ink">{v}</dd>
                  <dd className="text-xs text-ink-soft">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <LessonPreview t={t} />
        </div>
      </section>

      {/* ── Cities ───────────────────────────────────────────────────────── */}
      {cities.length > 0 && (
        <section className="border-t border-line bg-surface/50 py-14 sm:py-20">
          <div className="container-page">
            <SectionHeading
              eyebrow={t.citiesEyebrow}
              title={fill(t.citiesTitle, { cities: cities.length, missions: cities.reduce((n, c) => n + c.lessons, 0) })}
              lead={t.citiesLead}
              action={<Link href="/play" className="btn-outline">{t.allCities} <ArrowRight className="size-4" /></Link>}
            />
            <div className="rail mt-8 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-5">
              {cities.map((c) => <CityCard key={c.id} city={c} className="rail-item" />)}
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="scroll-mt-20 py-14 sm:py-24">
        <div className="container-page">
          <SectionHeading eyebrow={t.howEyebrow} title={t.howTitle} />
          <ol className="mt-8 grid gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {t.steps.map(([title, body], i) => {
              const Icon = STEP_ICONS[i];
              return (
                <li key={title} className="card relative flex gap-4 p-4 sm:block sm:p-6">
                  <span className="absolute end-4 top-4 font-display text-sm font-bold text-ink-soft/50 sm:end-5 sm:top-5">0{i + 1}</span>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-sunset-soft text-sunset">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 pe-6 sm:pe-0">
                    <h3 className="font-display text-lg font-bold sm:mt-5">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft sm:mt-2">{body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ── Star ladder ──────────────────────────────────────────────────── */}
      <section className="bg-navy py-14 text-white sm:py-24 dark:bg-navy-deep">
        <div className="container-page">
          <SectionHeading eyebrow={t.rankEyebrow} title={t.rankTitle} lead={t.rankLead} dark />
          <ol className="-mx-4 mt-8 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:mx-0 sm:mt-12 sm:gap-4 sm:px-0 lg:grid lg:grid-cols-7 lg:overflow-visible">
            {RANK_KEYS.map((key, i) => (
              <li key={key} className="flex min-w-32 snap-start flex-col items-center rounded-3xl border border-white/10 bg-white/5 px-3 py-6 text-center">
                <StarOrb rankKey={key} size={44 + i * 4} />
                <span className="mt-4 font-display font-bold">{dict.ranks[key].name}</span>
                <span className="mt-1 text-xs text-white/60">{fill(t.rankN, { n: i + 1 })}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/play" className="btn-primary px-6 py-3">{t.firstStardust} <ArrowRight className="size-4" /></Link>
            <Link href="/sky" className="btn border border-white/30 px-6 py-3 text-white hover:bg-white/10">
              <Sparkles className="size-4" /> {t.seeSky}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why it works ─────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-24">
        <div className="container-page">
          <SectionHeading eyebrow={t.whyEyebrow} title={t.whyTitle} lead={t.whyLead} center />
          <div className="mt-8 grid gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {t.why.map(([title, body], i) => {
              const Icon = WHY_ICONS[i];
              return (
                <div key={title} className="card flex gap-4 p-4 sm:block sm:p-6">
                  <Icon className="mt-0.5 size-6 shrink-0 text-sunset" />
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-bold sm:mt-4">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft sm:mt-2">{body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Group trips (live) ───────────────────────────────────────────── */}
      <section className="border-t border-line bg-surface/50 py-14 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow={t.tripsEyebrow}
            title={t.tripsTitle}
            lead={t.tripsLead}
            action={<Link href="/trips" className="btn-outline">{t.allTrips} <ArrowRight className="size-4" /></Link>}
          />
          {trips.length > 0 ? (
            <div className="rail mt-8 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {trips.map((trip, i) => (
                <div key={trip.id} className="rail-item [&>a]:flex-1"><ListingCard listing={trip} priority={i < 2} /></div>
              ))}
            </div>
          ) : (
            <div className="mt-10 grid gap-6 rounded-3xl border border-dashed border-line p-10 text-center">
              <p className="text-ink-soft">
                {t.noTrips}{" "}
                <Link href="/play" className="font-semibold text-sunset hover:underline">{t.noTripsLink}</Link>.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Host + FAQ ───────────────────────────────────────────────────── */}
      <section className="border-t border-line py-14 sm:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div className="card self-start overflow-hidden">
            <div className="bg-sunset-soft p-8">
              <Sparkles className="size-6 text-sunset" />
              <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{t.hostTitle}</h2>
              <p className="mt-3 text-ink-soft">{t.hostLead}</p>
            </div>
            <div className="flex flex-col gap-3 p-6 sm:flex-row">
              <Link href="/apply" className="btn-primary">{dict.nav.join} <ArrowRight className="size-4" /></Link>
              <Link href="/docs/trips#hosting-a-trip" className="btn-ghost">{t.hostHow}</Link>
            </div>
          </div>
          <div>
            <SectionHeading eyebrow={t.faqEyebrow} title={t.faqTitle} />
            <div className="mt-8 divide-y divide-line border-y border-line">
              {t.faq.map(([q, a]) => (
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

      {/* ── Final call ───────────────────────────────────────────────────── */}
      <section className="pb-14 sm:py-20">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[2rem] bg-sunset px-6 py-14 text-center text-white sm:px-12">
            <svg aria-hidden className="absolute inset-0 size-full opacity-20" viewBox="0 0 800 300" preserveAspectRatio="none">
              <path d="M-20 260 C 160 160, 300 300, 460 180 S 700 60, 820 120" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="3 14" strokeLinecap="round" />
            </svg>
            <h2 className="relative font-display text-3xl font-extrabold tracking-tight sm:text-5xl">{t.finalTitle}</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-white/90">{t.finalLead}</p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/play" className="btn bg-white px-6 py-3 text-navy hover:bg-white/90">{t.start} <ArrowRight className="size-4" /></Link>
              <Link href="/apply" className="btn border border-white/50 px-6 py-3 text-white hover:bg-white/10">{t.joinCommunity}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

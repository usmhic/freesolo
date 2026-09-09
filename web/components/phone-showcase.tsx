/**
 * Product presentation for the FreeSolo mobile app.
 *
 * The screens below are built in markup rather than being captured PNGs — they
 * mirror the real app's layout, palette and copy (mobile/src/theme, FeedScreen,
 * ExperienceDetailScreen, NotificationsScreen) so they stay sharp at any
 * density, follow the page theme, and never drift into showing a screen the app
 * doesn't actually have. Swap in real captures later by replacing a
 * <PhoneFrame> child with an <Image>.
 */
import {
  BellRing,
  CalendarCheck,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/cn";

/* ── Brand constants, mirrored from mobile/src/theme/index.ts ─────────────── */
const INK = "#0A0A0A";
const PAPER = "#F5F0E8";
const SAND = "#E6DDD0";
const CLAY = "#B8976A";
const SAGE = "#6B8F71";
const MUTED = "#8A8278";

/* ── Chrome ───────────────────────────────────────────────────────────────── */

function StatusBar() {
  return (
    <div
      className="flex items-center justify-between px-5 pt-3 text-[9px] font-medium"
      style={{ color: INK }}
    >
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <span className="inline-block h-2 w-3 rounded-[1px]" style={{ background: INK, opacity: 0.7 }} />
        <span className="inline-block h-2 w-2.5 rounded-[1px]" style={{ background: INK, opacity: 0.5 }} />
        <span className="inline-block h-2 w-4 rounded-[2px]" style={{ background: INK, opacity: 0.8 }} />
      </div>
    </div>
  );
}

function PhoneFrame({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <figure className={cn("flex flex-col items-center", className)}>
      <div
        className="relative w-[220px] shrink-0 rounded-[2.2rem] p-[7px] shadow-2xl sm:w-[240px]"
        style={{ background: INK }}
      >
        {/* notch */}
        <div
          className="absolute left-1/2 top-[7px] z-20 h-[18px] w-[74px] -translate-x-1/2 rounded-b-2xl"
          style={{ background: INK }}
        />
        <div
          className="relative aspect-[9/19] w-full overflow-hidden rounded-[1.75rem]"
          style={{ background: PAPER }}
        >
          <StatusBar />
          {children}
        </div>
      </div>
      <figcaption className="mt-4 text-center text-xs font-medium text-fd-muted-foreground">
        {label}
      </figcaption>
    </figure>
  );
}

/* ── Screen 1: the feed ───────────────────────────────────────────────────── */

const FILTERS = [
  { emoji: "✦", label: "All", active: true },
  { emoji: "🎨", label: "Art", active: false },
  { emoji: "🍜", label: "Food", active: false },
  { emoji: "🎵", label: "Music", active: false },
];

const FEED = [
  {
    emoji: "🏺",
    title: "Wheel-throwing morning in Alfama",
    meta: "Sat 14 Jun · 09:30",
    price: "€38",
    host: "Inês",
    filled: 5,
    max: 6,
  },
  {
    emoji: "🍜",
    title: "Ramen crawl, three counters",
    meta: "Sat 14 Jun · 19:00",
    price: "€25",
    host: "Tomás",
    filled: 3,
    max: 8,
  },
] as const;

function FeedScreen() {
  return (
    <div className="px-3.5 pt-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[8px] uppercase tracking-[0.14em]" style={{ color: MUTED }}>
            Lisbon
          </p>
          <p className="font-display text-[15px] font-bold leading-tight" style={{ color: INK }}>
            Experiences
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="grid size-6 place-items-center rounded-full text-[10px]"
            style={{ background: SAND }}
          >
            🗺️
          </span>
          <span
            className="grid size-6 place-items-center rounded-full text-[9px] font-semibold"
            style={{ background: INK, color: PAPER }}
          >
            A
          </span>
        </div>
      </div>

      {/* search */}
      <div
        className="mt-2.5 flex items-center gap-1.5 rounded-lg px-2 py-1.5"
        style={{ background: "#FFFFFF", border: `1px solid ${SAND}` }}
      >
        <span className="text-[8px]">🔍</span>
        <span className="text-[8px]" style={{ color: MUTED }}>
          Search experiences…
        </span>
      </div>

      {/* filters */}
      <div className="mt-2.5 flex gap-1.5 overflow-hidden">
        {FILTERS.map((f) => (
          <span
            key={f.label}
            className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[8px] font-medium"
            style={
              f.active
                ? { background: INK, color: PAPER }
                : { background: "#FFFFFF", color: INK, border: `1px solid ${SAND}` }
            }
          >
            <span>{f.emoji}</span>
            {f.label}
          </span>
        ))}
      </div>

      {/* cards */}
      <div className="mt-2.5 space-y-2">
        {FEED.map((e) => {
          const pct = Math.round((e.filled / e.max) * 100);
          const almost = e.max - e.filled <= 2;
          return (
            <div
              key={e.title}
              className="rounded-xl p-2.5"
              style={{ background: "#FFFFFF", border: `1px solid ${SAND}` }}
            >
              <div className="flex gap-2">
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-[15px]"
                  style={{ background: almost ? "#DC262614" : SAND }}
                >
                  {e.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-[9px] font-semibold leading-tight"
                    style={{ color: INK }}
                  >
                    {e.title}
                  </p>
                  <p className="mt-0.5 text-[7.5px]" style={{ color: MUTED }}>
                    {e.meta}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold leading-none" style={{ color: INK }}>
                    {e.price}
                  </p>
                  <p className="text-[6.5px]" style={{ color: MUTED }}>
                    /person
                  </p>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-1.5">
                <span
                  className="grid size-4 place-items-center rounded-full text-[6px] font-semibold"
                  style={{ background: CLAY, color: "#FFFFFF" }}
                >
                  {e.host[0]}
                </span>
                <span className="text-[7.5px] font-medium" style={{ color: INK }}>
                  {e.host}
                </span>
                <span
                  className="rounded-full px-1 py-px text-[6px] font-medium"
                  style={{ background: `${SAGE}22`, color: SAGE }}
                >
                  ✓ verified
                </span>
                <span className="ml-auto text-[7.5px] font-medium" style={{ color: MUTED }}>
                  {e.filled}/{e.max}
                </span>
              </div>

              <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full" style={{ background: SAND }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: almost ? "#DC2626" : SAGE }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Screen 2: experience detail ──────────────────────────────────────────── */

function DetailScreen() {
  return (
    <div className="flex h-full flex-col">
      <div
        className="relative mx-3.5 mt-3 grid h-[112px] place-items-center rounded-xl text-[38px]"
        style={{ background: SAND }}
      >
        🏺
        <span
          className="absolute left-2 top-2 rounded-full px-1.5 py-0.5 text-[6.5px] font-semibold"
          style={{ background: "#DC2626", color: "#FFFFFF" }}
        >
          1 seat left
        </span>
      </div>

      <div className="px-3.5 pt-2.5">
        <p className="font-display text-[13px] font-bold leading-tight" style={{ color: INK }}>
          Wheel-throwing morning in Alfama
        </p>
        <p className="mt-1 text-[8px]" style={{ color: MUTED }}>
          📍 Rua dos Remédios · Sat 14 Jun, 09:30 — 12:00
        </p>

        <div className="mt-2.5 flex items-center gap-1.5">
          <span
            className="grid size-6 place-items-center rounded-full text-[8px] font-semibold"
            style={{ background: CLAY, color: "#FFFFFF" }}
          >
            I
          </span>
          <div className="min-w-0">
            <p className="text-[8px] font-semibold leading-none" style={{ color: INK }}>
              Inês
            </p>
            <p className="mt-0.5 text-[7px]" style={{ color: MUTED }}>
              Hosting since 2023 · ★ 4.9
            </p>
          </div>
          <span
            className="ml-auto rounded-full px-1.5 py-0.5 text-[6.5px] font-medium"
            style={{ background: `${SAGE}22`, color: SAGE }}
          >
            ✓ verified host
          </span>
        </div>

        <p className="mt-2.5 text-[7.5px] leading-relaxed" style={{ color: MUTED }}>
          Six people, six wheels, one very patient teacher. We start with a demo, then you throw
          until something survives. Everything gets fired and posted to you.
        </p>

        <div
          className="mt-2.5 rounded-lg p-2"
          style={{ background: "#FFFFFF", border: `1px solid ${SAND}` }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[7.5px] font-medium" style={{ color: INK }}>
              Group confirms at 4
            </span>
            <span className="text-[7.5px] font-semibold" style={{ color: SAGE }}>
              5 / 6 joined
            </span>
          </div>
          <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full" style={{ background: SAND }}>
            <div className="h-full w-[83%] rounded-full" style={{ background: SAGE }} />
          </div>
          <p className="mt-1.5 text-[6.5px]" style={{ color: MUTED }}>
            Card charged only once the group confirms
          </p>
        </div>
      </div>

      <div className="mt-auto px-3.5 pb-3.5">
        <div
          className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-[9px] font-semibold"
          style={{ background: INK, color: PAPER }}
        >
          Reserve a seat · €38
        </div>
      </div>
    </div>
  );
}

/* ── Screen 3: notifications ──────────────────────────────────────────────── */

const NOTIFS = [
  { emoji: "🎉", title: "Your group is confirmed", body: "Wheel-throwing morning · Sat 09:30", fresh: true },
  { emoji: "✅", title: "Application approved", body: "Welcome to FreeSolo — here's your code", fresh: true },
  { emoji: "💬", title: "Inês replied to your review", body: "“So glad the bowl survived!”", fresh: false },
  { emoji: "🗓️", title: "Two days to go", body: "Ramen crawl · Thu 19:00", fresh: false },
] as const;

function NotificationsScreen() {
  return (
    <div className="px-3.5 pt-3">
      <p className="font-display text-[15px] font-bold leading-tight" style={{ color: INK }}>
        Updates
      </p>
      <p className="mt-0.5 text-[8px]" style={{ color: MUTED }}>
        2 new
      </p>

      <div className="mt-3 space-y-1.5">
        {NOTIFS.map((n) => (
          <div
            key={n.title}
            className="flex items-start gap-2 rounded-lg p-2"
            style={{
              background: n.fresh ? `${CLAY}14` : "#FFFFFF",
              border: `1px solid ${n.fresh ? `${CLAY}44` : SAND}`,
            }}
          >
            <span className="text-[13px] leading-none">{n.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[8.5px] font-semibold leading-tight" style={{ color: INK }}>
                {n.title}
              </p>
              <p className="mt-0.5 truncate text-[7.5px]" style={{ color: MUTED }}>
                {n.body}
              </p>
            </div>
            {n.fresh ? (
              <span className="mt-1 size-1.5 shrink-0 rounded-full" style={{ background: CLAY }} />
            ) : null}
          </div>
        ))}
      </div>

      <div
        className="mt-3 rounded-lg p-2.5 text-center"
        style={{ background: "#FFFFFF", border: `1px dashed ${SAND}` }}
      >
        <p className="text-[7.5px] font-medium" style={{ color: INK }}>
          That&apos;s everything
        </p>
        <p className="mt-0.5 text-[7px]" style={{ color: MUTED }}>
          We only message you about your own bookings
        </p>
      </div>
    </div>
  );
}

/* ── Section ──────────────────────────────────────────────────────────────── */

const PILLARS = [
  {
    icon: Users,
    title: "Four to eight people",
    body: "Small enough that you'll actually talk to everyone by the end.",
  },
  {
    icon: CalendarCheck,
    title: "Confirms, or it doesn't",
    body: "Reserve a seat and your card waits until the group actually comes together.",
  },
  {
    icon: ShieldCheck,
    title: "Everyone was reviewed",
    body: "Members and hosts both get read by a person before they can book or list.",
  },
  {
    icon: BellRing,
    title: "Told only what matters",
    body: "Notifications cover your bookings and your groups. Nothing else.",
  },
] as const;

export function PhoneShowcase() {
  return (
    <section className="relative overflow-hidden border-b border-fd-border">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(60% 60% at 15% 20%, #B8976A22, transparent 70%), radial-gradient(50% 50% at 85% 80%, #6B8F7122, transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-fd-border bg-fd-card px-3 py-1 text-xs font-medium text-fd-muted-foreground">
            <Sparkles className="size-3 text-[#B8976A]" />
            The app
          </span>
          <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Your next table for six,{" "}
            <span className="italic text-[#B8976A]">three taps away</span>
          </h2>
          <p className="mt-3 text-balance text-fd-muted-foreground">
            Browse what&apos;s happening in the city you&apos;re standing in, hold a seat before
            it&apos;s gone, and let FreeSolo handle the awkward part — whether enough people
            actually show up.
          </p>
        </div>

        {/* Devices — centre phone raised, outer two stepped back */}
        <div className="mt-14 flex flex-wrap items-end justify-center gap-6 sm:gap-8">
          <PhoneFrame label="Browse the feed" className="hidden lg:flex lg:translate-y-6 lg:scale-95 lg:opacity-95">
            <FeedScreen />
          </PhoneFrame>

          <PhoneFrame label="Hold your seat" className="z-10">
            <DetailScreen />
          </PhoneFrame>

          <PhoneFrame label="Stay in the loop" className="hidden sm:flex sm:translate-y-6 sm:scale-95 sm:opacity-95">
            <NotificationsScreen />
          </PhoneFrame>
        </div>

        {/* Pillars */}
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-fd-border bg-fd-card p-5">
              <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary">
                <Icon className="size-4" />
              </div>
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-fd-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 flex items-center justify-center gap-1.5 text-center text-xs text-fd-muted-foreground">
          <MapPin className="size-3.5" />
          The same three screens, in every city on the map above.
        </p>
      </div>
    </section>
  );
}

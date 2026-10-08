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

const KINDS = [
  { label: "All", active: false },
  { label: "🧭 Trips", active: true },
  { label: "✨ Experiences", active: false },
];

const FEED = [
  {
    emoji: "🏝️",
    cover: `linear-gradient(135deg, #1B2633, #4A7FA5)`,
    kind: "Trip · 5 days",
    title: "Azores island hop",
    meta: "10 – 14 Nov · São Miguel",
    price: "€640",
    host: "Hana",
    filled: 4,
    max: 8,
  },
  {
    emoji: "🏔️",
    cover: `linear-gradient(135deg, #1E2A24, ${SAGE})`,
    kind: "Trip · 3 days",
    title: "Picos de Europa hut-to-hut",
    meta: "21 – 23 Nov · Asturias",
    price: "€210",
    host: "Tomás",
    filled: 6,
    max: 7,
  },
] as const;

function FeedScreen() {
  return (
    <div className="px-3.5 pt-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[8px] uppercase tracking-[0.14em]" style={{ color: MUTED }}>
            Leaving soon
          </p>
          <p className="font-display text-[15px] font-bold leading-tight" style={{ color: INK }}>
            Group trips
          </p>
        </div>
        <span
          className="grid size-6 place-items-center rounded-full text-[9px] font-semibold"
          style={{ background: INK, color: PAPER }}
        >
          A
        </span>
      </div>

      {/* kind switch */}
      <div className="mt-2.5 flex gap-1">
        {KINDS.map((k) => (
          <span
            key={k.label}
            className="rounded-full px-2 py-1 text-[8px] font-medium"
            style={k.active ? { background: INK, color: PAPER } : { background: SAND, color: INK }}
          >
            {k.label}
          </span>
        ))}
      </div>

      {/* cards */}
      <div className="mt-2.5 space-y-2.5">
        {FEED.map((e) => {
          const pct = Math.round((e.filled / e.max) * 100);
          const almost = e.max - e.filled <= 2;
          return (
            <div
              key={e.title}
              className="overflow-hidden rounded-xl"
              style={{ background: "#FFFFFF", border: `1px solid ${SAND}` }}
            >
              <div className="relative grid h-[62px] place-items-center text-[26px]" style={{ background: e.cover }}>
                {e.emoji}
                <span
                  className="absolute left-1.5 top-1.5 rounded-full px-1.5 py-px text-[6.5px] font-semibold uppercase tracking-wide"
                  style={{ background: "#00000080", color: "#FFFFFF" }}
                >
                  {e.kind}
                </span>
                <span
                  className="absolute right-1.5 top-1.5 rounded-full px-1.5 py-px text-[7.5px] font-bold"
                  style={{ background: "#FFFFFFEE", color: INK }}
                >
                  {e.price}
                </span>
              </div>
              <div className="p-2">
                <p className="text-[7px]" style={{ color: MUTED }}>
                  {e.meta}
                </p>
                <p className="mt-0.5 truncate font-display text-[10px] font-bold leading-tight" style={{ color: INK }}>
                  {e.title}
                </p>
                <div className="mt-1.5 flex items-center gap-1">
                  <span
                    className="grid size-3.5 place-items-center rounded-full text-[5.5px] font-semibold"
                    style={{ background: CLAY, color: "#FFFFFF" }}
                  >
                    {e.host[0]}
                  </span>
                  <span className="text-[7px]" style={{ color: MUTED }}>
                    {e.host}
                  </span>
                  <span
                    className="rounded-full px-1 py-px text-[6px] font-medium"
                    style={{ background: SAND, color: INK }}
                  >
                    host picks
                  </span>
                  <span className="ml-auto text-[7px] font-medium" style={{ color: almost ? "#C2410C" : MUTED }}>
                    {almost ? `${e.max - e.filled} left` : `${e.filled}/${e.max}`}
                  </span>
                </div>
                <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full" style={{ background: SAND }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: almost ? "#C2410C" : CLAY }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Screen 2: trip detail ────────────────────────────────────────────────── */

const DAYS = ["Arrive · sunset at Sete Cidades", "Whale watching off the south coast", "Hot springs in Furnas"];
const GOING = ["A", "B", "M", "J"];

function DetailScreen() {
  return (
    <div className="flex h-full flex-col">
      <div
        className="relative grid h-[104px] place-items-center text-[40px]"
        style={{ background: "linear-gradient(135deg, #1B2633, #4A7FA5)" }}
      >
        🏝️
        <div className="absolute inset-x-0 bottom-0 h-10" style={{ background: "linear-gradient(transparent, #00000066)" }} />
        <span
          className="absolute bottom-2 left-3.5 rounded-full px-1.5 py-0.5 text-[6.5px] font-semibold uppercase tracking-wide"
          style={{ background: "#FFFFFF26", color: "#FFFFFF" }}
        >
          Group trip · 5 days
        </span>
      </div>

      <div className="px-3.5 pt-2.5">
        <p className="font-display text-[13px] font-bold leading-tight" style={{ color: INK }}>
          Azores island hop
        </p>
        <p className="mt-0.5 text-[7.5px]" style={{ color: MUTED }}>
          📅 10 – 14 Nov · 📍 São Miguel
        </p>

        <p className="mt-2 text-[7px] font-semibold uppercase tracking-wide" style={{ color: MUTED }}>
          Who&apos;s going
        </p>
        <div className="mt-1 flex items-center">
          {GOING.map((g, i) => (
            <span
              key={g}
              className="grid size-5 place-items-center rounded-full text-[7px] font-semibold"
              style={{
                background: [CLAY, SAGE, "#4A7FA5", "#8B4513"][i],
                color: "#FFFFFF",
                marginLeft: i ? -5 : 0,
                boxShadow: `0 0 0 1.5px ${PAPER}`,
              }}
            >
              {g}
            </span>
          ))}
          <span className="ml-1.5 text-[7px]" style={{ color: MUTED }}>
            4 of 8 · confirms at 4 ✓
          </span>
        </div>

        <p className="mt-2 text-[7px] font-semibold uppercase tracking-wide" style={{ color: MUTED }}>
          Day by day
        </p>
        <div className="mt-1 space-y-1">
          {DAYS.map((d, i) => (
            <div key={d} className="flex items-center gap-1.5">
              <span
                className="grid size-3.5 shrink-0 place-items-center rounded-full text-[6px] font-semibold"
                style={{ background: INK, color: PAPER }}
              >
                {i + 1}
              </span>
              <span className="truncate text-[7.5px]" style={{ color: INK }}>
                {d}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto px-3.5 pb-3.5">
        <p className="mb-1.5 text-center text-[6.5px]" style={{ color: MUTED }}>
          The host reads every request · settle with them directly
        </p>
        <div
          className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-[9px] font-semibold"
          style={{ background: INK, color: PAPER }}
        >
          Request to join · €640
        </div>
      </div>
    </div>
  );
}

/* ── Screen 3: notifications ──────────────────────────────────────────────── */

const NOTIFS = [
  { emoji: "✅", title: "You're in the group", body: "Hana accepted you on Azores island hop", fresh: true },
  { emoji: "🎒", title: "You're in! It's happening", body: "Azores island hop has enough travelers", fresh: true },
  { emoji: "💬", title: "New in Azores island hop", body: "Hana wrote in the group chat", fresh: false },
  { emoji: "✋", title: "New request to join", body: "Ben would like to join your trip", fresh: false },
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
          We only message you about your own trips
        </p>
      </div>
    </div>
  );
}

/* ── Section ──────────────────────────────────────────────────────────────── */

const PILLARS = [
  {
    icon: Users,
    title: "Twelve at most",
    body: "Most groups run four to eight — small enough to talk to everyone by the end.",
  },
  {
    icon: CalendarCheck,
    title: "Confirms, or it doesn't",
    body: "Nothing is locked in until enough travelers are in. FreeSolo never takes payment.",
  },
  {
    icon: ShieldCheck,
    title: "The host picks the group",
    body: "Every member was read by a person — and on trips, the host reads every request too.",
  },
  {
    icon: BellRing,
    title: "Told only what matters",
    body: "Requests, confirmations and a private group chat for each trip. Nothing else.",
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
            Your next trip,{" "}
            <span className="italic text-[#B8976A]">with people you&apos;d pick</span>
          </h2>
          <p className="mt-3 text-balance text-fd-muted-foreground">
            Browse trips members are hosting, see who&apos;s going, ask to join with a short
            intro, and sort the details in the group chat once you&apos;re in. FreeSolo handles
            the awkward part — whether enough people actually show up.
          </p>
        </div>

        {/* Devices — centre phone raised, outer two stepped back */}
        <div className="mt-14 flex flex-wrap items-end justify-center gap-6 sm:gap-8">
          <PhoneFrame label="Find a trip" className="hidden lg:flex lg:translate-y-6 lg:scale-95 lg:opacity-95">
            <FeedScreen />
          </PhoneFrame>

          <PhoneFrame label="Ask to join" className="z-10">
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
          Trips and experiences in every city on the map above.
        </p>
      </div>
    </section>
  );
}

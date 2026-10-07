import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Bell,
  Calendar,
  Compass,
  Heart,
  LayoutDashboard,
  MessagesSquare,
  Search,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { FreeSoloLogo } from "@/components/logo";
import { WorldMapSection } from "@/components/world-map";
import { PhoneShowcase } from "@/components/phone-showcase";

export const metadata: Metadata = {
  title: "FreeSolo — Small-group trips for solo travelers",
  description:
    "A vetted community where solo travelers join small-group trips and local experiences, and hosts pick who comes along. Apply to join — a real person reads every application.",
};

const FEATURES = [
  {
    icon: Compass,
    title: "Trips & experiences",
    description:
      "Multi-day group trips with a day-by-day itinerary, and few-hour experiences hosted by locals.",
  },
  {
    icon: Calendar,
    title: "Host-picked groups",
    description:
      "Ask to join with a short intro, see who's already going, and get confirmed once the group fills.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted, vetted hosts",
    description:
      "Every host and business goes through an application and identity-verification flow.",
  },
  {
    icon: Bell,
    title: "Real-time updates",
    description:
      "In-app and push notifications keep travelers and hosts in sync at every step.",
  },
  {
    icon: LayoutDashboard,
    title: "Full admin control",
    description:
      "Review applications, moderate listings, and manage users from one dashboard.",
  },
  {
    icon: MessagesSquare,
    title: "Reviews that go both ways",
    description:
      "Rate the experience afterwards; hosts can reply. Ratings stay attached to the host, not buried in a feed.",
  },
] as const;

const PROMISES = [
  {
    icon: Users,
    title: "The group is the product",
    body: "Trips and experiences cap at twelve travelers, and most run four to eight. Big enough for a proper conversation, small enough that nobody drifts to the edge of it.",
  },
  {
    icon: Wallet,
    title: "You never pay for a maybe",
    body: "Reserve a seat and nothing moves until the group actually confirms. If it doesn't come together, the reservation quietly lapses — no charge, no chasing.",
  },
  {
    icon: Heart,
    title: "Vetted on both sides",
    body: "Every member is read by a person before they can join or host — and on trips, the host still picks the group. It's slower than an open marketplace, and that's the entire point.",
  },
] as const;

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Apply to join",
    body: "FreeSolo is invite-gated. Submit a short application and a real person reviews it — usually within a day or two.",
  },
  {
    step: "02",
    title: "Find your group",
    body: "Browse group trips and local experiences. Ask to join with a short intro — FreeSolo never takes payment; you settle with the host.",
  },
  {
    step: "03",
    title: "Go & connect",
    body: "See who's going before you leave, then travel with people who chose the same trip you did.",
  },
  {
    step: "04",
    title: "Host your own",
    body: "Planning a trip anyway? Publish the itinerary and choose the solo travelers who come with you — or host a few hours at your venue."
  },
] as const;

const FOOTER_LINKS = [
  { href: "/apply",         label: "Apply to join"  },
  { href: "/apply/status",  label: "Check status"   },
  { href: "/docs",          label: "Help Center"    },
  { href: "/privacy",       label: "Privacy"        },
  { href: "/terms",         label: "Terms"          },
  { href: "/admin/sign-in", label: "Admin"          },
] as const;

function ButtonLink({
  href,
  variant = "primary",
  children,
}: {
  href: string;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
        variant === "primary"
          ? "bg-fd-primary text-fd-primary-foreground hover:opacity-90"
          : "border border-fd-border bg-fd-background hover:bg-fd-accent hover:text-fd-accent-foreground"
      )}
    >
      {children}
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-fd-border">
        <div
          className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--color-fd-border) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
          <span className="rounded-full border border-fd-border bg-fd-card px-3 py-1 text-xs font-medium text-fd-muted-foreground">
            🧭 Group trips · Local experiences · Vetted members
          </span>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
            Solo doesn&apos;t have to mean{" "}
            <span className="bg-gradient-to-r from-fd-primary to-[#B8976A] bg-clip-text italic text-transparent">
              alone
            </span>
          </h1>
          <p className="max-w-2xl text-balance text-base text-fd-muted-foreground sm:text-lg">
            Travelling by yourself is wonderful — right up until you want to do something
            <em> with</em> someone. On FreeSolo, members host small-group trips and local
            experiences, and every traveler has been vetted before they can ask to join. Five
            days island-hopping or one morning at a pottery wheel — no big-bus tours, no group
            chat with forty strangers.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/apply">
              Apply to join <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/apply/status" variant="secondary">
              <Search className="size-4" /> Check application status
            </ButtonLink>
          </div>
          <p className="text-xs text-fd-muted-foreground">
            Invite-gated · A person reads every application · Usually answered within 48 hours
          </p>
        </div>
      </section>

      {/* ── World Map ─────────────────────────────────────────────────────── */}
      <WorldMapSection />

      {/* ── Why it works ──────────────────────────────────────────────────── */}
      <section className="border-b border-fd-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Built around the awkward parts
            </h2>
            <p className="mt-3 text-fd-muted-foreground">
              Most of what makes group travel work isn&apos;t the itinerary — it&apos;s who else
              turns up, whether it happens at all, and what it costs you when it doesn&apos;t.
              Those are the three things FreeSolo actually solves.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {PROMISES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl border border-fd-border bg-fd-card p-6 transition-colors hover:bg-fd-accent/40"
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-[#B8976A]/15 text-[#B8976A]">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-fd-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mobile app showcase ───────────────────────────────────────────── */}
      <PhoneShowcase />

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="border-b border-fd-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              From stranger to fellow traveler in four steps
            </h2>
            <p className="mt-3 text-fd-muted-foreground">
              Joining, booking, going, hosting. The whole loop takes about ten minutes of
              your attention and gives you back a weekend you&apos;d never have planned alone.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map(({ step, title, body }) => (
              <div key={step} className="flex flex-col gap-3">
                <span className="text-3xl font-bold text-fd-primary/30">
                  {step}
                </span>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-fd-muted-foreground">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ─────────────────────────────────────────────────── */}
      <section className="border-b border-fd-border">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything a small-group travel platform needs
            </h2>
            <p className="mt-3 text-fd-muted-foreground">
              Discovery, bookings, reviews and moderation — purpose-built for small-group
              travel rather than bolted onto a ticketing tool.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-fd-border bg-fd-card p-6 transition-colors hover:bg-fd-accent/40"
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-fd-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ──────────────────────────────────────────────────────── */}
      <section className="border-b border-fd-border bg-fd-card/40">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6 py-16 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            The next one is already being planned
          </h2>
          <p className="max-w-xl text-fd-muted-foreground">
            Somewhere a host is finishing an itinerary and deciding who to bring along.
            Applications take about five minutes, and a person reads every one — usually inside
            48 hours.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/apply">
              Apply to join <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/apply/status" variant="secondary">
              <Search className="size-4" /> Check your status
            </ButtonLink>
          </div>
          <p className="text-xs text-fd-muted-foreground">
            Already a member? Open the app and sign in. Curious how review works?{" "}
            <Link href="/docs/joining" className="underline underline-offset-2 hover:text-fd-foreground">
              Read the Help Center
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="mt-auto">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
          <FreeSoloLogo />
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-fd-muted-foreground">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-fd-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-fd-muted-foreground">
            © {new Date().getFullYear()} FreeSolo. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Bell,
  Calendar,
  Compass,
  CreditCard,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { FreeSoloLogo } from "@/components/logo";
import { WorldMapSection } from "@/components/world-map";

export const metadata: Metadata = {
  title: "FreeSolo — Small-group travel experiences",
  description:
    "FreeSolo connects solo travelers with curated small-group experiences hosted by people who actually live there.",
};

const FEATURES = [
  {
    icon: Compass,
    title: "Curated experiences",
    description:
      "Bookable group activities across cities and categories — hand-reviewed before they go live.",
  },
  {
    icon: Calendar,
    title: "Bookings & confirmations",
    description:
      "Reserve a seat, get confirmed once the group fills, and manage everything from your profile.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted, vetted hosts",
    description:
      "Every host and business goes through an application and identity-verification flow.",
  },
  {
    icon: CreditCard,
    title: "Payments & payouts",
    description:
      "Stripe-powered checkout for travelers and automatic payouts for hosts — built right in.",
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
      "Review applications, moderate listings, manage users, and process payouts from one dashboard.",
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
    title: "Browse & reserve",
    body: "Explore a live feed of small-group experiences. Reserve a seat — your card is only charged once the group confirms.",
  },
  {
    step: "03",
    title: "Go & connect",
    body: "Show up, meet people who chose the same thing you did, and experience a city the way locals actually see it.",
  },
  {
    step: "04",
    title: "Host & earn credits",
    body: "Know your city? Register a venue and host your own experience. A slice of every booking becomes travel credit for your next trip.",
  },
] as const;

const FOOTER_LINKS = [
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
            🌍 Small groups · Local hosts · Real connections
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Travel further, together —{" "}
            <span className="bg-gradient-to-r from-fd-primary to-purple-500 bg-clip-text text-transparent">
              one experience at a time
            </span>
          </h1>
          <p className="max-w-2xl text-balance text-base text-fd-muted-foreground sm:text-lg">
            FreeSolo connects solo travelers with curated small-group
            experiences hosted by people who actually live there. No big-bus
            tours, no stranger-danger group chats — just the right number of
            people, in the right place, with someone who knows it.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/docs">
              How it works <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/docs/joining" variant="secondary">
              Apply to join
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ── World Map ─────────────────────────────────────────────────────── */}
      <WorldMapSection />

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="border-b border-fd-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              From stranger to fellow traveler in four steps
            </h2>
            <p className="mt-3 text-fd-muted-foreground">
              The whole loop — joining, booking, going, and hosting — is built
              around one idea: you never pay for something that doesn&apos;t happen.
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
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything a travel experience platform needs
            </h2>
            <p className="mt-3 text-fd-muted-foreground">
              Discovery, bookings, payments, and moderation — purpose-built for
              small-group travel.
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
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to go?
          </h2>
          <p className="max-w-xl text-fd-muted-foreground">
            Visit the Help Center to see how applying, booking, hosting, and
            travel credits work — written for travelers and hosts, not
            engineers.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/docs">
              Visit the Help Center <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/admin/sign-in" variant="secondary">
              Admin sign in
            </ButtonLink>
          </div>
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

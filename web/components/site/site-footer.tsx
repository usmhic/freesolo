import Link from "next/link";
import { FreeSoloLogo } from "@/components/logo";

const COLUMNS = [
  {
    title: "Travel",
    links: [
      { href: "/trips", label: "Browse trips" },
      { href: "/trips?kind=experience", label: "Local experiences" },
      { href: "/planner", label: "Trip planner" },
    ],
  },
  {
    title: "Membership",
    links: [
      { href: "/apply", label: "Apply to join" },
      { href: "/apply/status", label: "Application status" },
      { href: "/sign-in", label: "Sign in" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/docs", label: "Help center" },
      { href: "/docs/trips", label: "How group trips work" },
      { href: "/docs/hosting", label: "Hosting" },
    ],
  },
  {
    title: "FreeSolo",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "https://github.com/usmhic/freesolo", label: "Open source" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.3fr_2fr]">
        <div className="max-w-sm">
          <FreeSoloLogo />
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Small-group trips for solo travelers. Every member is read by a person, every group
            stays under twelve, and FreeSolo never takes payment.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-ink">{col.title}</p>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-ink-soft transition hover:text-sunset">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FreeSolo. Made for people who travel alone, but not always by themselves.</p>
          <p>Maps © OpenStreetMap contributors · Routing by openrouteservice</p>
        </div>
      </div>
    </footer>
  );
}

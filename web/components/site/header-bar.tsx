"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, LogOut, Map, Menu, Route, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { FreeSoloLogo } from "@/components/logo";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/trips", label: "Trips" },
  { href: "/planner", label: "Planner" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/docs", label: "Help" },
];

type HeaderUser = { name: string; email: string; role: string } | null;

export function HeaderBar({ user }: { user: HeaderUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" }).catch(() => {});
    router.push("/");
    router.refresh();
  }

  const active = (href: string) => !href.includes("#") && (pathname === href || pathname.startsWith(href + "/"));

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors",
        scrolled || open ? "border-line bg-paper/90 backdrop-blur-md" : "border-transparent bg-paper/0"
      )}
    >
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" aria-label="FreeSolo home" className="shrink-0">
          <FreeSoloLogo />
        </Link>

        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active(item.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium transition",
                active(item.href) ? "bg-fd-muted text-ink" : "text-ink-soft hover:text-ink"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <>
              <Link href="/planner" className="btn-ghost btn-sm">
                <Route className="size-4" /> My plans
              </Link>
              {(user.role === "admin" || user.role === "business") && (
                <Link href="/admin" className="btn-ghost btn-sm">Dashboard</Link>
              )}
              <span
                title={user.email}
                className="inline-flex size-9 items-center justify-center rounded-full bg-navy font-display text-sm font-bold text-white dark:bg-sunset"
              >
                {user.name[0]?.toUpperCase()}
              </span>
              <button type="button" onClick={signOut} className="btn-ghost btn-sm" aria-label="Sign out">
                <LogOut className="size-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="btn-ghost btn-sm">Sign in</Link>
              <Link href="/apply" className="btn-primary btn-sm">
                Apply to join <ArrowRight className="size-4" />
              </Link>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-10 items-center justify-center rounded-full text-ink hover:bg-fd-muted"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Phone menu */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-paper md:hidden"
      >
        <nav aria-label="Main" className="container-page flex flex-col gap-1 py-6">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-2xl px-4 py-4 font-display text-xl font-bold text-ink hover:bg-fd-muted"
            >
              {item.label}
              <ArrowRight className="size-5 text-ink-soft" />
            </Link>
          ))}
          <div className="mt-6 grid gap-3 border-t border-line pt-6">
            {user ? (
              <>
                <p className="px-4 text-sm text-ink-soft">Signed in as {user.email}</p>
                <Link href="/planner" className="btn-outline w-full"><Map className="size-4" /> My plans</Link>
                <button type="button" onClick={signOut} className="btn-ghost w-full">
                  <LogOut className="size-4" /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/apply" className="btn-primary w-full py-3">Apply to join <ArrowRight className="size-4" /></Link>
                <Link href="/sign-in" className="btn-outline w-full py-3">Sign in</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

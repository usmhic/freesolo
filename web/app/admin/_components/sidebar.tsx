"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Building2,
  Compass,
  CalendarCheck,
  Users,
  Banknote,
  Star,
  Code2,
  Megaphone,
  Image as ImageIcon,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { FreeSoloLogo } from "@/components/logo";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/businesses", label: "Businesses", icon: Building2 },
  { href: "/admin/experiences", label: "Experiences", icon: Compass },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/payouts", label: "Payouts", icon: Banknote },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/api-docs", label: "API Docs", icon: Code2 },
];

// Business owners only see their own slice — no applications, user
// management, the businesses directory, or API docs.
const BUSINESS_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/experiences", label: "Experiences", icon: Compass },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/payouts", label: "Payouts", icon: Banknote },
];

export function AdminSidebar({
  user,
  scope,
}: {
  user: { name: string | null; email: string; image: string | null };
  scope: "admin" | "business";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const NAV = scope === "business" ? BUSINESS_NAV : ADMIN_NAV;

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/admin/sign-in");
    router.refresh();
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-fd-border bg-fd-card/40">
      <div className="flex items-center gap-2 border-b border-fd-border px-5 py-4">
        <div>
          <FreeSoloLogo />
          <p className="mt-0.5 text-xs text-fd-muted-foreground">{scope === "business" ? "Business" : "Admin"}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-fd-primary text-fd-primary-foreground"
                  : "text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-fd-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="size-8 rounded-full object-cover" />
          ) : (
            <div className="flex size-8 items-center justify-center rounded-full bg-fd-secondary text-xs font-semibold text-fd-secondary-foreground">
              {(user.name ?? user.email).slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-none">{user.name ?? "Admin"}</p>
            <p className="truncate text-xs text-fd-muted-foreground">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

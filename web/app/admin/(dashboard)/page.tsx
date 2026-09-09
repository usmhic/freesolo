import Link from "next/link";
import {
  Users,
  FileText,
  Building2,
  Compass,
  CalendarCheck,
  Star,
  ArrowUpRight,
} from "lucide-react";
import { requireDashboardUser } from "@/lib/admin";
import { apiGet } from "@/lib/api-client";
import { Badge, Card, EmptyState, PageHeader, StatCard, fmtDate, fmtDateTime } from "../_components/ui";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const viewer = await requireDashboardUser();
  const data: any = await apiGet("/api/admin/dashboard");

  if (data.scope === "business") {
    if (data.noBusiness) {
      return (
        <div className="space-y-6">
          <PageHeader title="Dashboard" description="Your business overview." />
          <Card><EmptyState>No business is linked to your account yet.</EmptyState></Card>
        </div>
      );
    }
    return <BusinessDashboard data={data} />;
  }

  return <AdminDashboard data={data} viewer={viewer} />;
}

function AdminDashboard({ data, viewer }: { data: any; viewer: any }) {
  const recentApplications: any[] = data.recentApplications ?? [];
  const recentBookings: any[]     = data.recentBookings ?? [];
  const recentReviews: any[]      = data.recentReviews ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="An overview of FreeSolo activity right now." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total users" value={data.totalUsers ?? 0} icon={<Users className="size-4 text-fd-muted-foreground" />} />
        <StatCard
          label="Applications awaiting review"
          value={data.pendingApplications ?? 0}
          hint={(data.pendingApplications ?? 0) > 0 ? "Needs attention" : "All caught up"}
          icon={<FileText className="size-4 text-fd-muted-foreground" />}
        />
        <StatCard
          label="Businesses awaiting review"
          value={data.pendingBusinesses ?? 0}
          hint={(data.pendingBusinesses ?? 0) > 0 ? "Needs attention" : "All caught up"}
          icon={<Building2 className="size-4 text-fd-muted-foreground" />}
        />
        <StatCard label="Active experiences" value={data.activeExperiences ?? 0} icon={<Compass className="size-4 text-fd-muted-foreground" />} />
        <StatCard
          label="Bookings this month"
          value={data.monthBookings ?? 0}
          hint="Confirmed & completed"
          icon={<CalendarCheck className="size-4 text-fd-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ActivityCard title="Recent applications" href="/admin/applications" icon={<FileText className="size-4" />} empty="No applications yet.">
          {recentApplications.map((a: any) => (
            <ActivityRow
              key={a.id}
              title={a.user.name || a.user.email}
              subtitle={a.story.slice(0, 70) + (a.story.length > 70 ? "…" : "")}
              meta={fmtDateTime(a.createdAt)}
              badge={a.status}
            />
          ))}
        </ActivityCard>

        <ActivityCard title="Recent bookings" href="/admin/bookings" icon={<CalendarCheck className="size-4" />} empty="No bookings yet.">
          {recentBookings.map((b: any) => (
            <ActivityRow
              key={b.id}
              title={b.experience.title}
              subtitle={`${b.user.name || b.user.email} · ${b.seats} seat${b.seats !== 1 ? "s" : ""}`}
              meta={fmtDateTime(b.createdAt)}
              badge={b.status}
            />
          ))}
        </ActivityCard>

        <ActivityCard title="Recent reviews" href="/admin/reviews" icon={<Star className="size-4" />} empty="No reviews yet.">
          {recentReviews.map((r: any) => (
            <ActivityRow
              key={r.id}
              title={`${r.rating}★ — ${r.experience?.title ?? "Experience"}`}
              subtitle={r.body.slice(0, 70) + (r.body.length > 70 ? "…" : "")}
              meta={fmtDateTime(r.createdAt)}
              footer={r.author.name || r.author.email}
            />
          ))}
        </ActivityCard>
      </div>
    </div>
  );
}

function BusinessDashboard({ data }: { data: any }) {
  const recentBookings: any[] = data.recentBookings ?? [];
  const recentReviews: any[]  = data.recentReviews ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description={`Overview for ${data.business?.name ?? "your business"}.`} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active experiences" value={data.activeExperiences ?? 0} icon={<Compass className="size-4 text-fd-muted-foreground" />} />
        <StatCard
          label="Bookings this month"
          value={data.monthBookings ?? 0}
          hint="Confirmed & completed"
          icon={<CalendarCheck className="size-4 text-fd-muted-foreground" />}
        />
        <StatCard label="Status" value={<Badge>{data.business?.status ?? "—"}</Badge>} icon={<Building2 className="size-4 text-fd-muted-foreground" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ActivityCard title="Recent bookings" href="/admin/bookings" icon={<CalendarCheck className="size-4" />} empty="No bookings yet.">
          {recentBookings.map((b: any) => (
            <ActivityRow
              key={b.id}
              title={b.experience.title}
              subtitle={`${b.user.name || b.user.email} · ${b.seats} seat${b.seats !== 1 ? "s" : ""}`}
              meta={fmtDateTime(b.createdAt)}
              badge={b.status}
            />
          ))}
        </ActivityCard>

        <ActivityCard title="Recent reviews" href="/admin/reviews" icon={<Star className="size-4" />} empty="No reviews yet.">
          {recentReviews.map((r: any) => (
            <ActivityRow
              key={r.id}
              title={`${r.rating}★ — ${r.experience?.title ?? "Experience"}`}
              subtitle={r.body.slice(0, 70) + (r.body.length > 70 ? "…" : "")}
              meta={fmtDateTime(r.createdAt)}
              footer={r.author.name || r.author.email}
            />
          ))}
        </ActivityCard>
      </div>
    </div>
  );
}

function ActivityCard({
  title, href, icon, empty, children,
}: {
  title: string; href: string; icon: React.ReactNode; empty: string; children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  const hasItems = items.flat().filter(Boolean).length > 0;
  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between border-b border-fd-border px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium">{icon}{title}</div>
        <Link href={href} className="flex items-center gap-1 text-xs text-fd-muted-foreground hover:text-fd-foreground">
          View all <ArrowUpRight className="size-3" />
        </Link>
      </div>
      <div className="flex-1 divide-y divide-fd-border">
        {hasItems ? children : <EmptyState>{empty}</EmptyState>}
      </div>
    </Card>
  );
}

function ActivityRow({ title, subtitle, meta, badge, footer }: {
  title: string; subtitle: string; meta: string; badge?: string; footer?: string;
}) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-medium">{title}</p>
        {badge && <Badge>{badge}</Badge>}
      </div>
      <p className="mt-0.5 truncate text-xs text-fd-muted-foreground">{subtitle}</p>
      <div className="mt-1.5 flex items-center justify-between text-xs text-fd-muted-foreground">
        {footer && <span>{footer}</span>}
        <span className="ml-auto">{meta}</span>
      </div>
    </div>
  );
}

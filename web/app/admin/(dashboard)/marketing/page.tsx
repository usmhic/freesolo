import { requireAdmin } from "@/lib/admin";
import { apiGet } from "@/lib/api-client";
import { SEGMENTS, type SegmentKey } from "@/lib/marketing";
import { Card, EmptyState, PageHeader, StatCard } from "../../_components/ui";
import { CampaignForm } from "./_components/campaign-form";
import { CampaignCard } from "./_components/campaign-card";

export const dynamic = "force-dynamic";

export default async function AdminMarketingPage() {
  await requireAdmin();

  const [campaignsResult, counts] = await Promise.all([
    apiGet<any>("/api/admin/marketing/campaigns?limit=100"),
    apiGet<Record<SegmentKey, number>>("/api/admin/marketing/segment-counts"),
  ]);

  const campaigns: any[] = campaignsResult.data ?? [];

  const segments = (Object.keys(SEGMENTS) as SegmentKey[]).map((key) => ({
    value: key,
    label: SEGMENTS[key].label,
    description: SEGMENTS[key].description,
    count: counts[key] ?? 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketing"
        description="Send segmented announcements and scheduled email campaigns to your community."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {segments.map((s) => (
          <StatCard key={s.value} label={s.label} value={s.count} hint={s.description} />
        ))}
      </div>

      <CampaignForm segments={segments} />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-fd-muted-foreground">Campaigns</h2>
        {campaigns.length === 0 ? (
          <Card>
            <EmptyState>No campaigns yet — create your first one above.</EmptyState>
          </Card>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c: any) => (
              <CampaignCard key={c.id} campaign={c} segments={segments} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

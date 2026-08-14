import { requireDashboardUser } from "@/lib/admin";
import { apiGet } from "@/lib/api-client";
import { processPayout } from "../../actions";
import { ActionButton } from "../../_components/action-button";
import { Badge, Card, EmptyState, Money, PageHeader, Table, Td, Th, fmtDateTime } from "../../_components/ui";

export const dynamic = "force-dynamic";

export default async function AdminPayoutsPage() {
  const viewer = await requireDashboardUser();

  const [pendingResult, recentResult] = await Promise.all([
    apiGet<any>("/api/admin/payouts?status=pending&limit=200"),
    apiGet<any>("/api/admin/payouts?status=paid&limit=25"),
  ]);

  const pending: any[] = pendingResult.data ?? [];
  const recent: any[]  = recentResult.data ?? [];
  const pendingTotal = pending.reduce((sum: number, p: any) => sum + (p.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payouts"
        description={
          viewer.scope === "business"
            ? `${pending.length} pending · ${new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(pendingTotal)} owed to you`
            : `${pending.length} pending · ${new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(pendingTotal)} owed to hosts`
        }
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-fd-muted-foreground">Pending</h2>
        {pending.length === 0 ? (
          <Card><EmptyState>No payouts waiting to be processed. 🎉</EmptyState></Card>
        ) : (
          <div className="space-y-3">
            {pending.map((p: any) => {
              const stripeAccountId = p.host?.businesses?.[0]?.stripeAccountId;
              return (
                <Card key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {p.booking?.experience?.emoji} {p.booking?.experience?.title}
                    </p>
                    <p className="text-xs text-fd-muted-foreground">
                      {p.host?.name || p.host?.email} · {p.host?.email} · booked {fmtDateTime(p.createdAt)}
                    </p>
                    {!stripeAccountId && (
                      <p className="mt-1 text-xs text-fd-error">Host has no connected Stripe account — payout will fail.</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <p className="text-lg font-semibold tabular-nums"><Money amount={p.amount} currency={p.currency} /></p>
                    {viewer.scope === "admin" ? (
                      <ActionButton
                        variant="primary"
                        action={processPayout.bind(null, p.id)}
                        confirm={`Send ${new Intl.NumberFormat("en-IE", { style: "currency", currency: p.currency || "EUR" }).format(p.amount)} to ${p.host?.name || p.host?.email} via Stripe Connect?`}
                      >
                        Process payout
                      </ActionButton>
                    ) : (
                      <Badge>pending</Badge>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-fd-muted-foreground">Recently paid</h2>
        {recent.length === 0 ? (
          <Card><EmptyState>No payouts have been processed yet.</EmptyState></Card>
        ) : (
          <Table>
            <thead>
              <tr className="border-b border-fd-border">
                <Th>Experience</Th>
                <Th>Host</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Paid</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fd-border">
              {recent.map((p: any) => (
                <tr key={p.id}>
                  <Td>{p.booking?.experience?.emoji} {p.booking?.experience?.title}</Td>
                  <Td>
                    <p>{p.host?.name || "—"}</p>
                    <p className="text-xs text-fd-muted-foreground">{p.host?.email}</p>
                  </Td>
                  <Td><Money amount={p.amount} currency={p.currency} /></Td>
                  <Td><Badge>{p.status}</Badge></Td>
                  <Td className="text-fd-muted-foreground">{p.paidAt ? fmtDateTime(p.paidAt) : "—"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>
    </div>
  );
}

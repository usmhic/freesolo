import { requireAdmin } from "@/lib/admin";
import { apiGet } from "@/lib/api-client";
import { reviewApplication, updateApplication, deleteApplication } from "../../actions";
import { ActionButton } from "../../_components/action-button";
import { EditModal } from "../../_components/edit-modal";
import { Badge, Card, EmptyState, PageHeader, Table, Td, Th, fmtDateTime } from "../../_components/ui";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  await requireAdmin();

  const result = await apiGet<any>("/api/admin/applications?limit=100");
  const applications: any[] = result.data ?? [];
  const pending  = applications.filter((a: any) => a.status === "pending");
  const reviewed = applications.filter((a: any) => a.status !== "pending");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description={`${pending.length} awaiting review · ${result.total ?? applications.length} total`}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-fd-muted-foreground">Awaiting review</h2>
        {pending.length === 0 ? (
          <Card><EmptyState>No applications waiting for review. 🎉</EmptyState></Card>
        ) : (
          <div className="space-y-3">
            {pending.map((app: any) => (
              <Card key={app.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{app.user.name || app.user.email}</p>
                    <p className="text-xs text-fd-muted-foreground">
                      {app.user.email}
                      {app.user.phone ? ` · ${app.user.phone}` : ""} · applied {fmtDateTime(app.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <ActionButton
                      variant="primary"
                      action={reviewApplication.bind(null, app.id, "approved")}
                      confirm={`Approve ${app.user.name || app.user.email}'s application? They'll get a welcome email and can sign in right away with this email — one-time code, Google, or Apple.`}
                    >
                      Approve
                    </ActionButton>
                    <ActionButton
                      variant="danger"
                      action={reviewApplication.bind(null, app.id, "rejected")}
                      confirm={`Reject ${app.user.name || app.user.email}'s application?`}
                    >
                      Reject
                    </ActionButton>
                  </div>
                </div>
                {app.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={app.imageUrl} alt="" className="mt-3 h-32 w-full max-w-xs rounded-lg object-cover" />
                )}
                <p className="mt-3 whitespace-pre-wrap text-sm text-fd-foreground">{app.story}</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-fd-muted-foreground">Reviewed</h2>
        {reviewed.length === 0 ? (
          <Card><EmptyState>No reviewed applications yet.</EmptyState></Card>
        ) : (
          <Table>
            <thead>
              <tr className="border-b border-fd-border">
                <Th>Applicant</Th>
                <Th>Status</Th>
                <Th>Note</Th>
                <Th>Reviewed</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fd-border">
              {reviewed.map((app: any) => (
                <tr key={app.id}>
                  <Td>
                    <p className="font-medium">{app.user.name || app.user.email}</p>
                    <p className="text-xs text-fd-muted-foreground">{app.user.email}</p>
                  </Td>
                  <Td><Badge>{app.status}</Badge></Td>
                  <Td className="max-w-xs truncate text-fd-muted-foreground">{app.reviewNote || "—"}</Td>
                  <Td className="text-fd-muted-foreground">{app.reviewedAt ? fmtDateTime(app.reviewedAt) : "—"}</Td>
                  <Td>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <EditModal
                        title={`Edit application — ${app.user.name || app.user.email}`}
                        trigger={
                          <span className="rounded-lg bg-fd-secondary px-3 py-1.5 text-xs font-medium text-fd-secondary-foreground hover:bg-fd-accent">
                            Edit
                          </span>
                        }
                        fields={[
                          { name: "story", label: "Story", type: "textarea", rows: 5 },
                          { name: "reviewNote", label: "Review note", type: "textarea", rows: 3 },
                        ]}
                        initialValues={{
                          story: app.story ?? "",
                          reviewNote: app.reviewNote ?? "",
                        }}
                        action={updateApplication.bind(null, app.id)}
                      />
                      <ActionButton
                        action={deleteApplication.bind(null, app.id)}
                        variant="danger"
                        confirm="Delete this application? This can't be undone."
                      >
                        Delete
                      </ActionButton>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>
    </div>
  );
}

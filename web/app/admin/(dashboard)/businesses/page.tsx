import { requireAdmin } from "@/lib/admin";
import { apiGet } from "@/lib/api-client";
import { setBusinessStatus, updateBusiness, deleteBusiness } from "../../actions";
import { ActionSelect } from "../../_components/action-select";
import { ActionButton } from "../../_components/action-button";
import { EditModal } from "../../_components/edit-modal";
import { Badge, Card, EmptyState, PageHeader, Table, Td, Th, fmtDateTime } from "../../_components/ui";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
];

export default async function AdminBusinessesPage() {
  await requireAdmin();

  const result = await apiGet<any>("/api/admin/businesses?limit=100");
  const businesses: any[] = result.data ?? [];
  const pendingCount = businesses.filter((b: any) => b.status === "pending").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Businesses"
        description={`${pendingCount} awaiting review · ${result.total ?? businesses.length} total`}
      />

      {businesses.length === 0 ? (
        <Card><EmptyState>No businesses have been registered yet.</EmptyState></Card>
      ) : (
        <Table>
          <thead>
            <tr className="border-b border-fd-border">
              <Th>Business</Th>
              <Th>Owner</Th>
              <Th>Location</Th>
              <Th>Experiences</Th>
              <Th>Stripe</Th>
              <Th>Status</Th>
              <Th>Created</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-fd-border">
            {businesses.map((b: any) => (
              <tr key={b.id}>
                <Td>
                  <p className="font-medium">{b.name}</p>
                  <p className="text-xs capitalize text-fd-muted-foreground">{b.type}</p>
                </Td>
                <Td>
                  <p>{b.owner.name || "—"}</p>
                  <p className="text-xs text-fd-muted-foreground">{b.owner.email}</p>
                </Td>
                <Td className="text-fd-muted-foreground">{b.city}, {b.country}</Td>
                <Td>{b._count?.experiences ?? 0}</Td>
                <Td>
                  {b.stripeAccountId ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400">connected</Badge>
                  ) : (
                    <Badge className="bg-zinc-500/10 text-zinc-600 ring-zinc-500/20 dark:text-zinc-400">none</Badge>
                  )}
                </Td>
                <Td>
                  <ActionSelect
                    value={b.status}
                    options={STATUS_OPTIONS}
                    action={setBusinessStatus.bind(null, b.id)}
                  />
                </Td>
                <Td className="text-fd-muted-foreground">{fmtDateTime(b.createdAt)}</Td>
                <Td>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <EditModal
                      title={`Edit ${b.name}`}
                      trigger={
                        <span className="rounded-lg bg-fd-secondary px-3 py-1.5 text-xs font-medium text-fd-secondary-foreground hover:bg-fd-accent">
                          Edit
                        </span>
                      }
                      fields={[
                        { name: "name", label: "Name" },
                        { name: "type", label: "Type" },
                        { name: "address", label: "Address" },
                        { name: "city", label: "City" },
                        { name: "country", label: "Country" },
                        { name: "description", label: "Description", type: "textarea", rows: 3 },
                        { name: "website", label: "Website" },
                      ]}
                      initialValues={{
                        name: b.name,
                        type: b.type ?? "",
                        address: b.address ?? "",
                        city: b.city,
                        country: b.country,
                        description: b.description ?? "",
                        website: b.website ?? "",
                      }}
                      action={updateBusiness.bind(null, b.id)}
                    />
                    <ActionButton
                      action={deleteBusiness.bind(null, b.id)}
                      variant="danger"
                      confirm={`Delete ${b.name}? This can't be undone.`}
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
    </div>
  );
}

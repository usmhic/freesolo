import { Star } from "lucide-react";
import { requireDashboardUser } from "@/lib/admin";
import { apiGet } from "@/lib/api-client";
import {
  setExperienceFeatured, setExperienceStatus, updateExperience, deleteExperience, markExperienceCompleted,
} from "../../actions";
import { ActionButton } from "../../_components/action-button";
import { ActionSelect } from "../../_components/action-select";
import { EditModal } from "../../_components/edit-modal";
import { Badge, Card, EmptyState, Money, PageHeader, Table, Td, Th, fmtDate } from "../../_components/ui";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

export default async function AdminExperiencesPage() {
  const viewer = await requireDashboardUser();

  const result = await apiGet<any>("/api/admin/experiences?limit=100");
  const experiences: any[] = result.data ?? [];
  const featuredCount = experiences.filter((e: any) => e.featured).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Experiences" description={`${result.total ?? experiences.length} total · ${featuredCount} featured`} />

      {experiences.length === 0 ? (
        <Card><EmptyState>No experiences have been created yet.</EmptyState></Card>
      ) : (
        <Table>
          <thead>
            <tr className="border-b border-fd-border">
              <Th>Experience</Th>
              <Th>Host</Th>
              <Th>Date</Th>
              <Th>Price</Th>
              <Th>Bookings</Th>
              <Th>Featured</Th>
              <Th>Status</Th>
              {viewer.scope === "admin" && <Th>Actions</Th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-fd-border">
            {experiences.map((e: any) => (
              <tr key={e.id}>
                <Td>
                  <p className="font-medium">{e.emoji} {e.title}</p>
                  <p className="text-xs text-fd-muted-foreground">{e.business?.name} · {e.city}, {e.country} · <span className="capitalize">{e.category}</span></p>
                </Td>
                <Td>
                  <p>{e.host?.name || "—"}</p>
                  <p className="text-xs text-fd-muted-foreground">{e.host?.email}</p>
                </Td>
                <Td className="text-fd-muted-foreground">{fmtDate(e.date)} · {e.time}</Td>
                <Td><Money amount={e.price} currency={e.currency} /></Td>
                <Td>
                  {e._count?.bookings ?? 0} · {e._count?.reviews ?? 0} <Star className="inline size-3 -mt-0.5" />
                </Td>
                <Td>
                  {viewer.scope === "admin" ? (
                    <ActionButton
                      variant={e.featured ? "primary" : "ghost"}
                      action={setExperienceFeatured.bind(null, e.id, !e.featured)}
                    >
                      {e.featured ? "Featured" : "Feature"}
                    </ActionButton>
                  ) : (
                    <Badge>{e.featured ? "Featured" : "—"}</Badge>
                  )}
                </Td>
                <Td>
                  {viewer.scope === "admin" && e.status !== "completed" ? (
                    <ActionSelect
                      value={e.status}
                      options={STATUS_OPTIONS}
                      action={setExperienceStatus.bind(null, e.id)}
                    />
                  ) : (
                    <Badge className="capitalize">{e.status}</Badge>
                  )}
                </Td>
                {viewer.scope === "admin" && (
                  <Td>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <EditModal
                        title={`Edit ${e.title}`}
                        trigger={
                          <span className="rounded-lg bg-fd-secondary px-3 py-1.5 text-xs font-medium text-fd-secondary-foreground hover:bg-fd-accent">
                            Edit
                          </span>
                        }
                        fields={[
                          { name: "title", label: "Title" },
                          { name: "description", label: "Description", type: "textarea", rows: 4 },
                          { name: "category", label: "Category" },
                          { name: "emoji", label: "Emoji" },
                          { name: "city", label: "City" },
                          { name: "country", label: "Country" },
                          { name: "date", label: "Date" },
                          { name: "time", label: "Time" },
                          { name: "durationMins", label: "Duration (mins)", type: "number" },
                          { name: "minSeats", label: "Min seats", type: "number" },
                          { name: "maxSeats", label: "Max seats", type: "number" },
                          { name: "price", label: "Price", type: "number" },
                        ]}
                        initialValues={{
                          title: e.title,
                          description: e.description ?? "",
                          category: e.category,
                          emoji: e.emoji ?? "",
                          city: e.city,
                          country: e.country ?? "",
                          date: e.date,
                          time: e.time,
                          durationMins: e.durationMins,
                          minSeats: e.minSeats,
                          maxSeats: e.maxSeats,
                          price: e.price,
                        }}
                        action={updateExperience.bind(null, e.id)}
                      />
                      {e.status !== "completed" && (
                        <ActionButton
                          action={markExperienceCompleted.bind(null, e.id)}
                          confirm={`Mark "${e.title}" as completed? This moves its confirmed bookings to completed and lets attendees rate & share photos.`}
                        >
                          Mark completed
                        </ActionButton>
                      )}
                      <ActionButton
                        action={deleteExperience.bind(null, e.id)}
                        variant="danger"
                        confirm={`Delete "${e.title}"? This can't be undone.`}
                      >
                        Delete
                      </ActionButton>
                    </div>
                  </Td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

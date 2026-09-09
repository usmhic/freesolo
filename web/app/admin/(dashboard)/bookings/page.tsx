import Link from "next/link";
import { requireDashboardUser } from "@/lib/admin";
import { apiGet } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { updateBooking, deleteBooking } from "../../actions";
import { ActionButton } from "../../_components/action-button";
import { EditModal } from "../../_components/edit-modal";
import { Badge, Card, EmptyState, PageHeader, Table, Td, Th, fmtDateTime } from "../../_components/ui";

export const dynamic = "force-dynamic";

const STATUSES = ["all", "pending", "confirmed", "completed", "cancelled", "refunded"] as const;
const BOOKING_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const viewer = await requireDashboardUser();
  const { status } = await searchParams;
  const filter = STATUSES.includes(status as (typeof STATUSES)[number]) ? status : "all";

  const params = new URLSearchParams({ limit: "100" });
  if (filter && filter !== "all") params.set("status", filter);

  const result = await apiGet<any>(`/api/admin/bookings?${params}`);
  const bookings: any[] = result.data ?? [];
  const totals = result.totals ?? { confirmedCount: 0 };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        description={`${totals.confirmedCount} confirmed/completed`}
      />

      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/admin/bookings" : `/admin/bookings?status=${s}`}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
              filter === s
                ? "bg-fd-primary text-fd-primary-foreground"
                : "bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent"
            )}
          >
            {s}
          </Link>
        ))}
      </div>

      {bookings.length === 0 ? (
        <Card><EmptyState>No bookings match this filter.</EmptyState></Card>
      ) : (
        <Table>
          <thead>
            <tr className="border-b border-fd-border">
              <Th>Experience</Th>
              <Th>Traveler</Th>
              <Th>Seats</Th>
              <Th>Status</Th>
              <Th>Booked</Th>
              {viewer.scope === "admin" && <Th>Actions</Th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-fd-border">
            {bookings.map((b: any) => (
              <tr key={b.id}>
                <Td>
                  <p className="font-medium">{b.experience?.emoji} {b.experience?.title}</p>
                  <p className="text-xs text-fd-muted-foreground">{b.experience?.city}</p>
                </Td>
                <Td>
                  <p>{b.user?.name || "—"}</p>
                  <p className="text-xs text-fd-muted-foreground">{b.user?.email}</p>
                </Td>
                <Td>{b.seats}</Td>
                <Td><Badge>{b.status}</Badge></Td>
                <Td className="text-fd-muted-foreground">{fmtDateTime(b.createdAt)}</Td>
                {viewer.scope === "admin" && (
                  <Td>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <EditModal
                        title={`Edit booking — ${b.experience?.title}`}
                        trigger={
                          <span className="rounded-lg bg-fd-secondary px-3 py-1.5 text-xs font-medium text-fd-secondary-foreground hover:bg-fd-accent">
                            Edit
                          </span>
                        }
                        fields={[
                          { name: "status", label: "Status", type: "select", options: BOOKING_STATUS_OPTIONS },
                          { name: "seats", label: "Seats", type: "number" },
                          { name: "guestNote", label: "Guest note", type: "textarea", rows: 3 },
                        ]}
                        initialValues={{
                          status: b.status,
                          seats: b.seats,
                          guestNote: b.guestNote ?? "",
                        }}
                        action={updateBooking.bind(null, b.id)}
                      />
                      <ActionButton
                        action={deleteBooking.bind(null, b.id)}
                        variant="danger"
                        confirm="Delete this booking? This can't be undone."
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

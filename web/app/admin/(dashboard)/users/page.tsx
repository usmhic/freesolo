import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { apiGet } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import {
  setUserRole, setUserStatus, updateUser, deleteUser, sendUserNotification,
} from "../../actions";
import { ActionSelect } from "../../_components/action-select";
import { ActionButton } from "../../_components/action-button";
import { EditModal } from "../../_components/edit-modal";
import { Card, EmptyState, PageHeader, Table, Td, Th, fmtDate } from "../../_components/ui";

export const dynamic = "force-dynamic";

const ROLE_OPTIONS = [
  { value: "traveler", label: "Traveler" },
  { value: "business", label: "Business" },
  { value: "admin", label: "Admin" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
];

const ROLE_FILTERS = ["all", "traveler", "business", "admin"] as const;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const me = await requireAdmin();
  const { q, role } = await searchParams;
  const roleFilter = ROLE_FILTERS.includes(role as (typeof ROLE_FILTERS)[number]) ? role : "all";

  const params = new URLSearchParams({ limit: "200" });
  if (q) params.set("q", q);
  if (roleFilter && roleFilter !== "all") params.set("role", roleFilter);

  const result = await apiGet<any>(`/api/admin/users?${params}`);
  const users: any[] = result.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description={`${result.total ?? users.length} total · search and manage roles & status`} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <form className="flex-1 min-w-[200px] max-w-sm">
          {roleFilter && roleFilter !== "all" && <input type="hidden" name="role" value={roleFilter} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by name or email…"
            className="w-full rounded-lg border border-fd-border bg-fd-background px-3 py-1.5 text-sm outline-none ring-fd-ring focus:ring-2"
          />
        </form>
        <div className="flex flex-wrap gap-1.5">
          {ROLE_FILTERS.map((r) => (
            <Link
              key={r}
              href={r === "all" ? "/admin/users" : `/admin/users?role=${r}`}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                roleFilter === r
                  ? "bg-fd-primary text-fd-primary-foreground"
                  : "bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent"
              )}
            >
              {r}
            </Link>
          ))}
        </div>
      </div>

      {users.length === 0 ? (
        <Card><EmptyState>No users match this search.</EmptyState></Card>
      ) : (
        <Table>
          <thead>
            <tr className="border-b border-fd-border">
              <Th>User</Th>
              <Th>Activity</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-fd-border">
            {users.map((u: any) => {
              const isMe = u.id === me.id;
              return (
                <tr key={u.id}>
                  <Td>
                    <p className="font-medium">{u.name || "—"} {isMe && <span className="text-xs text-fd-muted-foreground">(you)</span>}</p>
                    <p className="text-xs text-fd-muted-foreground">{u.email}</p>
                  </Td>
                  <Td className="text-xs text-fd-muted-foreground">
                    {u._count?.bookings ?? 0} bookings · {u._count?.experiences ?? 0} hosted · {u._count?.businesses ?? 0} businesses
                  </Td>
                  <Td>
                    <ActionSelect
                      value={u.role}
                      options={ROLE_OPTIONS}
                      action={setUserRole.bind(null, u.id)}
                      className={isMe ? "pointer-events-none opacity-50" : undefined}
                    />
                  </Td>
                  <Td>
                    <ActionSelect
                      value={u.status}
                      options={STATUS_OPTIONS}
                      action={setUserStatus.bind(null, u.id)}
                      className={isMe ? "pointer-events-none opacity-50" : undefined}
                    />
                  </Td>
                  <Td className="text-fd-muted-foreground">{fmtDate(u.createdAt)}</Td>
                  <Td>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <EditModal
                        title={`Edit ${u.name ?? u.email}`}
                        trigger={
                          <span className="rounded-lg bg-fd-secondary px-3 py-1.5 text-xs font-medium text-fd-secondary-foreground hover:bg-fd-accent">
                            Edit
                          </span>
                        }
                        fields={[
                          { name: "name", label: "Name" },
                          { name: "email", label: "Email" },
                          { name: "phone", label: "Phone" },
                          { name: "bio", label: "Bio", type: "textarea", rows: 3 },
                          { name: "countriesVisited", label: "Countries visited", type: "number" },
                        ]}
                        initialValues={{
                          name: u.name ?? "",
                          email: u.email ?? "",
                          phone: u.phone ?? "",
                          bio: u.bio ?? "",
                          countriesVisited: u.countriesVisited ?? 0,
                        }}
                        action={updateUser.bind(null, u.id)}
                      />
                      <EditModal
                        title={`Notify ${u.name ?? u.email}`}
                        trigger={
                          <span className="rounded-lg bg-fd-secondary px-3 py-1.5 text-xs font-medium text-fd-secondary-foreground hover:bg-fd-accent">
                            Notify
                          </span>
                        }
                        fields={[
                          { name: "title", label: "Title" },
                          { name: "body", label: "Message", type: "textarea", rows: 3 },
                        ]}
                        initialValues={{ title: "", body: "" }}
                        action={sendUserNotification.bind(null, u.id)}
                      />
                      {!isMe && (
                        <ActionButton
                          action={deleteUser.bind(null, u.id)}
                          variant="danger"
                          confirm={`Delete ${u.name ?? u.email}? This can't be undone.`}
                        >
                          Delete
                        </ActionButton>
                      )}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}

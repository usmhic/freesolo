import { requireAdmin } from "@/lib/admin";
import { apiGet } from "@/lib/api-client";
import { deleteUpload, deleteEventPhoto } from "../../actions";
import { ActionButton } from "../../_components/action-button";
import { Card, EmptyState, PageHeader, fmtDateTime } from "../../_components/ui";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  await requireAdmin();

  const [uploadsResult, photosResult] = await Promise.all([
    apiGet<any>("/api/admin/media/uploads?limit=100"),
    apiGet<any>("/api/admin/media/event-photos?limit=100"),
  ]);

  const uploads: any[]     = uploadsResult.data ?? [];
  const eventPhotos: any[] = photosResult.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Media" description={`${uploadsResult.total ?? uploads.length} uploads · ${photosResult.total ?? eventPhotos.length} shared event photos`} />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-fd-muted-foreground">User uploads</h2>
        {uploads.length === 0 ? (
          <Card><EmptyState>No uploads yet.</EmptyState></Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {uploads.map((u: any) => (
              <Card key={u.id} className="overflow-hidden p-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.url} alt="" className="h-32 w-full object-cover" />
                <div className="space-y-1.5 p-2">
                  <p className="truncate text-xs font-medium">{u.user?.name || u.user?.email || "—"}</p>
                  <p className="text-xs capitalize text-fd-muted-foreground">{u.type} · {fmtDateTime(u.createdAt)}</p>
                  <ActionButton
                    action={deleteUpload.bind(null, u.id)}
                    variant="danger"
                    confirm="Delete this upload? This can't be undone."
                    className="w-full"
                  >
                    Delete
                  </ActionButton>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-fd-muted-foreground">Shared event photos</h2>
        {eventPhotos.length === 0 ? (
          <Card><EmptyState>No shared event photos yet.</EmptyState></Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {eventPhotos.map((p: any) => (
              <Card key={p.id} className="overflow-hidden p-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="h-32 w-full object-cover" />
                <div className="space-y-1.5 p-2">
                  <p className="truncate text-xs font-medium">{p.experience?.emoji} {p.experience?.title || "—"}</p>
                  <p className="truncate text-xs text-fd-muted-foreground">
                    {p.user?.name || p.user?.email || "—"}{p.experience?.city ? ` · ${p.experience.city}` : ""}
                  </p>
                  <p className="text-xs text-fd-muted-foreground">{fmtDateTime(p.createdAt)}</p>
                  <ActionButton
                    action={deleteEventPhoto.bind(null, p.id)}
                    variant="danger"
                    confirm="Delete this photo? This can't be undone."
                    className="w-full"
                  >
                    Delete
                  </ActionButton>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

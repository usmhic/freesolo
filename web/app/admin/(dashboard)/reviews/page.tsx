import { Star } from "lucide-react";
import { requireDashboardUser } from "@/lib/admin";
import { apiGet } from "@/lib/api-client";
import { deleteReview, updateReview } from "../../actions";
import { ActionButton } from "../../_components/action-button";
import { EditModal } from "../../_components/edit-modal";
import { Card, EmptyState, PageHeader, fmtDateTime } from "../../_components/ui";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const viewer = await requireDashboardUser();

  const result = await apiGet<any>("/api/admin/reviews?limit=100");
  const reviews: any[] = result.data ?? [];
  const avgRating = reviews.length
    ? reviews.reduce((sum: number, r: any) => sum + (r.rating ?? 0), 0) / reviews.length
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        description={`${result.total ?? reviews.length} total · ${avgRating ? avgRating.toFixed(1) : "—"}★ average rating`}
      />

      {reviews.length === 0 ? (
        <Card><EmptyState>No reviews have been written yet.</EmptyState></Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((r: any) => (
            <Card key={r.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`size-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-fd-border"}`} />
                    ))}
                    <span className="ml-1 text-sm font-medium">
                      {r.experience ? `${r.experience.emoji} ${r.experience.title}` : "Experience deleted"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-fd-muted-foreground">
                    {r.author?.name || r.author?.email}
                    {r.target ? ` → reviewing ${r.target.name || r.target.email}` : ""} · {fmtDateTime(r.createdAt)}
                  </p>
                </div>
                {viewer.scope === "admin" && (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <EditModal
                      title="Edit review"
                      trigger={
                        <span className="rounded-lg bg-fd-secondary px-3 py-1.5 text-xs font-medium text-fd-secondary-foreground hover:bg-fd-accent">
                          Edit
                        </span>
                      }
                      fields={[
                        { name: "rating", label: "Rating (1-5)", type: "number" },
                        { name: "body", label: "Review", type: "textarea", rows: 4 },
                        { name: "reply", label: "Host reply", type: "textarea", rows: 3 },
                      ]}
                      initialValues={{
                        rating: r.rating,
                        body: r.body ?? "",
                        reply: r.reply ?? "",
                      }}
                      action={updateReview.bind(null, r.id)}
                    />
                    <ActionButton
                      variant="danger"
                      action={deleteReview.bind(null, r.id)}
                      confirm="Delete this review? This can't be undone."
                    >
                      Delete
                    </ActionButton>
                  </div>
                )}
              </div>
              <p className="mt-3 text-sm">{r.body}</p>
              {r.reply && (
                <div className="mt-3 rounded-lg bg-fd-muted px-3 py-2 text-sm">
                  <p className="text-xs font-medium text-fd-muted-foreground">Host reply</p>
                  <p className="mt-0.5">{r.reply}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

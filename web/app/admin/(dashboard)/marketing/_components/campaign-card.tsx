"use client";

import { useState, useTransition } from "react";
import {
  deleteCampaign,
  scheduleCampaign,
  sendCampaignNow,
  unscheduleCampaign,
  updateCampaign,
  type CampaignInput,
} from "../../../actions";
import { ActionButton } from "../../../_components/action-button";
import { Badge, Card, fmtDateTime } from "../../../_components/ui";

const inputClass =
  "w-full rounded-lg border border-fd-border bg-fd-background px-3 py-1.5 text-sm outline-none ring-fd-ring focus:ring-2";

interface Campaign {
  id: string;
  title: string;
  subject: string;
  body: string;
  segment: string;
  status: string;
  scheduledAt: string | Date | null;
  sentAt: string | Date | null;
  recipientCount: number;
  createdBy: { name: string | null; email: string };
}

export function CampaignCard({
  campaign,
  segments,
}: {
  campaign: Campaign;
  segments: { value: string; label: string; count: number }[];
}) {
  const editable = campaign.status === "draft" || campaign.status === "scheduled";

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<CampaignInput>({
    title: campaign.title,
    subject: campaign.subject,
    body: campaign.body,
    segment: campaign.segment,
  });
  const [scheduleAt, setScheduleAt] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const segmentInfo = segments.find((s) => s.value === campaign.segment);

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await updateCampaign(campaign.id, form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditing(false);
    });
  }

  function handleSchedule() {
    if (!scheduleAt) return;
    setError(null);
    startTransition(async () => {
      const result = await scheduleCampaign(campaign.id, new Date(scheduleAt).toISOString());
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <Card className="space-y-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{campaign.title}</p>
          <p className="text-xs text-fd-muted-foreground">{campaign.subject}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge>{campaign.status}</Badge>
          {editable && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg bg-fd-secondary px-3 py-1.5 text-xs font-medium text-fd-secondary-foreground transition-colors hover:bg-fd-accent"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Internal title"
            />
            <select
              className={inputClass}
              value={form.segment}
              onChange={(e) => setForm((f) => ({ ...f, segment: e.target.value }))}
            >
              {segments.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label} ({s.count})
                </option>
              ))}
            </select>
          </div>
          <input
            className={inputClass}
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            placeholder="Email subject"
          />
          <textarea
            className={inputClass}
            rows={5}
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            placeholder="Email body"
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-lg bg-fd-primary px-3 py-1.5 text-xs font-medium text-fd-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save changes"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setForm({ title: campaign.title, subject: campaign.subject, body: campaign.body, segment: campaign.segment });
              }}
              className="rounded-lg bg-fd-secondary px-3 py-1.5 text-xs font-medium text-fd-secondary-foreground transition-colors hover:bg-fd-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="line-clamp-3 whitespace-pre-wrap text-sm text-fd-muted-foreground">{campaign.body}</p>
      )}

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fd-muted-foreground">
        <span>Segment: {segmentInfo?.label ?? campaign.segment}</span>
        <span>·</span>
        <span>by {campaign.createdBy.name ?? campaign.createdBy.email}</span>
        {campaign.recipientCount > 0 && (
          <>
            <span>·</span>
            <span>{campaign.recipientCount} sent</span>
          </>
        )}
        {campaign.scheduledAt && (
          <>
            <span>·</span>
            <span>Scheduled for {fmtDateTime(campaign.scheduledAt)}</span>
          </>
        )}
        {campaign.sentAt && (
          <>
            <span>·</span>
            <span>Sent {fmtDateTime(campaign.sentAt)}</span>
          </>
        )}
      </div>

      {editable && (
        <div className="flex flex-wrap items-end gap-2 border-t border-fd-border pt-3">
          <ActionButton
            variant="primary"
            action={sendCampaignNow.bind(null, campaign.id)}
            confirm={`Send "${campaign.title}" now to ~${segmentInfo?.count ?? 0} recipient${(segmentInfo?.count ?? 0) === 1 ? "" : "s"}?`}
          >
            Send now
          </ActionButton>

          <label className="flex flex-col gap-1 text-xs text-fd-muted-foreground">
            Schedule for
            <input
              type="datetime-local"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
              className={inputClass}
            />
          </label>
          <button
            onClick={handleSchedule}
            disabled={isPending || !scheduleAt}
            className="inline-flex items-center justify-center rounded-lg bg-fd-secondary px-3 py-1.5 text-xs font-medium text-fd-secondary-foreground transition-colors hover:bg-fd-accent disabled:opacity-50"
          >
            Schedule
          </button>

          {campaign.status === "scheduled" && (
            <ActionButton variant="secondary" action={unscheduleCampaign.bind(null, campaign.id)}>
              Unschedule
            </ActionButton>
          )}

          <ActionButton
            variant="danger"
            action={deleteCampaign.bind(null, campaign.id)}
            confirm={`Delete the "${campaign.title}" campaign? This can't be undone.`}
          >
            Delete
          </ActionButton>
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </Card>
  );
}

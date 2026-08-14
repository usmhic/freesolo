"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { apiCall, apiDelete, apiPatch, apiPost, ApiError } from "@/lib/api-client";

export type ActionResult = { ok: true } | { ok: false; error: string };

function handleError(e: unknown): { ok: false; error: string } {
  return { ok: false, error: e instanceof ApiError ? e.message : String(e) };
}

// ── Applications ────────────────────────────────────────────────────────────

export async function reviewApplication(
  applicationId: string,
  decision: "approved" | "rejected",
  reviewNote?: string
): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiPatch(`/api/admin/applications/${applicationId}/review`, { decision, reviewNote });
    revalidatePath("/admin/applications");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

export async function updateApplication(
  applicationId: string,
  input: { story?: string; reviewNote?: string }
): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiPatch(`/api/admin/applications/${applicationId}/fields`, input);
    revalidatePath("/admin/applications");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

export async function deleteApplication(applicationId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiDelete(`/api/admin/applications/${applicationId}`);
    revalidatePath("/admin/applications");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

// ── Businesses ──────────────────────────────────────────────────────────────

export async function setBusinessStatus(businessId: string, status: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiPatch(`/api/admin/businesses/${businessId}/status`, { status });
    revalidatePath("/admin/businesses");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

export interface BusinessInput {
  name: string; type: string; address: string;
  city: string; country: string; description: string; website: string;
}

export async function updateBusiness(businessId: string, input: BusinessInput): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiPatch(`/api/admin/businesses/${businessId}`, input);
    revalidatePath("/admin/businesses");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

export async function deleteBusiness(businessId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiDelete(`/api/admin/businesses/${businessId}`);
    revalidatePath("/admin/businesses");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

// ── Experiences ─────────────────────────────────────────────────────────────

export async function setExperienceStatus(experienceId: string, status: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiPatch(`/api/admin/experiences/${experienceId}/status`, { status });
    revalidatePath("/admin/experiences");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

export async function setExperienceFeatured(experienceId: string, featured: boolean): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiPatch(`/api/admin/experiences/${experienceId}/featured`, { featured });
    revalidatePath("/admin/experiences");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

export interface ExperienceInput {
  title: string; description: string; category: string; emoji: string;
  city: string; country: string; date: string; time: string;
  durationMins: number; minSeats: number; maxSeats: number; price: number;
}

export async function updateExperience(experienceId: string, input: ExperienceInput): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiPatch(`/api/admin/experiences/${experienceId}`, input);
    revalidatePath("/admin/experiences");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

export async function deleteExperience(experienceId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiDelete(`/api/admin/experiences/${experienceId}`);
    revalidatePath("/admin/experiences");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

export async function markExperienceCompleted(experienceId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiPost(`/api/admin/experiences/${experienceId}/complete`);
    revalidatePath("/admin/experiences");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

// ── Users ───────────────────────────────────────────────────────────────────

export async function setUserRole(userId: string, role: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiPatch(`/api/admin/users/${userId}/role`, { role });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

export async function setUserStatus(userId: string, status: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiPatch(`/api/admin/users/${userId}/status`, { status });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

export interface UserInput {
  name: string; email: string; phone: string;
  bio: string; travelCredits: number; countriesVisited: number;
}

export async function updateUser(userId: string, input: UserInput): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiPatch(`/api/admin/users/${userId}`, input);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiDelete(`/api/admin/users/${userId}`);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

export interface NotificationInput { title: string; body: string; }

export async function sendUserNotification(userId: string, input: NotificationInput): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiPost(`/api/admin/users/${userId}/notify`, input);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

// ── Payouts ─────────────────────────────────────────────────────────────────

export async function processPayout(payoutId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiPost(`/api/admin/payouts/${payoutId}/process`);
    revalidatePath("/admin/payouts");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

// ── Bookings ────────────────────────────────────────────────────────────────

export interface BookingInput { status: string; seats: number; guestNote: string; }

export async function updateBooking(bookingId: string, input: BookingInput): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiPatch(`/api/admin/bookings/${bookingId}`, input);
    revalidatePath("/admin/bookings");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

export async function deleteBooking(bookingId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiDelete(`/api/admin/bookings/${bookingId}`);
    revalidatePath("/admin/bookings");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

// ── Reviews ─────────────────────────────────────────────────────────────────

export interface ReviewInput { rating: number; body: string; reply: string; }

export async function updateReview(reviewId: string, input: ReviewInput): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiPatch(`/api/admin/reviews/${reviewId}`, input);
    revalidatePath("/admin/reviews");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

export async function deleteReview(reviewId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiDelete(`/api/admin/reviews/${reviewId}`);
    revalidatePath("/admin/reviews");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

// ── Marketing campaigns ─────────────────────────────────────────────────────

export interface CampaignInput {
  title: string; subject: string; body: string; segment: string;
}

export async function createCampaign(input: CampaignInput): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiPost("/api/admin/marketing/campaigns", input);
    revalidatePath("/admin/marketing");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

export async function updateCampaign(campaignId: string, input: CampaignInput): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiPatch(`/api/admin/marketing/campaigns/${campaignId}`, input);
    revalidatePath("/admin/marketing");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

export async function deleteCampaign(campaignId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiDelete(`/api/admin/marketing/campaigns/${campaignId}`);
    revalidatePath("/admin/marketing");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

export async function sendCampaignNow(campaignId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiPost(`/api/admin/marketing/campaigns/${campaignId}/send`);
    revalidatePath("/admin/marketing");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

export async function scheduleCampaign(campaignId: string, scheduledAt: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiPatch(`/api/admin/marketing/campaigns/${campaignId}`, { scheduledAt });
    revalidatePath("/admin/marketing");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

export async function unscheduleCampaign(campaignId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiPatch(`/api/admin/marketing/campaigns/${campaignId}`, { scheduledAt: null });
    revalidatePath("/admin/marketing");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

// ── Media ───────────────────────────────────────────────────────────────────

export async function deleteUpload(uploadId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiDelete(`/api/admin/media/uploads/${uploadId}`);
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

export async function deleteEventPhoto(photoId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await apiDelete(`/api/admin/media/event-photos/${photoId}`);
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (e) { return handleError(e); }
}

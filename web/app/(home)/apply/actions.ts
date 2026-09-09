"use server";

import { z } from "zod";
import { apiGet, apiPost, ApiError } from "@/lib/api-client";
import { validate } from "@/lib/validate";

/**
 * Public application flow.
 *
 * Both actions hit endpoints the API leaves unauthenticated:
 *   POST /api/applications                     — submit a join request
 *   GET  /api/applications/{reference}/status  — look one up by reference
 *
 * The reference is the application's UUID, handed to the applicant on submit.
 * Status is keyed on it rather than on an email address so that knowing
 * someone's email is not enough to discover whether they applied.
 */

/** Matches the mobile ApplyScreen and the Help Center, both of which ask for a real paragraph. */
const STORY_MIN = 80;

const ApplySchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name"),
  email: z.email("That doesn't look like an email address"),
  story: z
    .string()
    .trim()
    .min(STORY_MIN, `Give us at least ${STORY_MIN} characters — a real paragraph beats a one-liner`),
  imageUrl: z.url("That photo link isn't a valid URL").or(z.literal("")).optional(),
});

export type ApplyState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; reference: string; name: string };

type ApplicationResponse = {
  id: string;
  user: { name: string; email: string };
  status: string;
};

export async function submitApplication(
  _prev: ApplyState,
  formData: FormData
): Promise<ApplyState> {
  const parsed = validate<z.infer<typeof ApplySchema>>(ApplySchema, {
    name: formData.get("name"),
    email: formData.get("email"),
    story: formData.get("story"),
    imageUrl: formData.get("imageUrl") ?? "",
  });

  if (!parsed.ok) return { status: "error", message: parsed.message };

  try {
    const app = await apiPost<ApplicationResponse>("/api/applications", {
      name: parsed.data.name,
      email: parsed.data.email,
      story: parsed.data.story,
      imageUrl: parsed.data.imageUrl || null,
    });

    return { status: "success", reference: app.id, name: app.user?.name ?? parsed.data.name };
  } catch (e) {
    return {
      status: "error",
      message:
        e instanceof ApiError
          ? e.message
          : "We couldn't reach the review desk just now. Please try again in a moment.",
    };
  }
}

export type StatusState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "found"; application: ApplicationStatus };

export type ApplicationStatus = {
  reference: string;
  name: string;
  status: string;
  submittedAt: string;
  reviewedAt: string | null;
};

const ReferenceSchema = z
  .string()
  .trim()
  .min(8, "Paste the full reference from your confirmation email");

export async function checkApplicationStatus(
  _prev: StatusState,
  formData: FormData
): Promise<StatusState> {
  const parsed = ReferenceSchema.safeParse(formData.get("reference"));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid reference" };
  }

  try {
    const application = await apiGet<ApplicationStatus>(
      `/api/applications/${encodeURIComponent(parsed.data)}/status`
    );
    return { status: "found", application };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return {
        status: "error",
        message:
          "No application matches that reference. Check it against your confirmation email — it's easy to drop a character.",
      };
    }
    return {
      status: "error",
      message:
        e instanceof ApiError
          ? e.message
          : "We couldn't look that up just now. Please try again in a moment.",
    };
  }
}

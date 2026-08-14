// Campaign sending and audience queries are handled by the Spring Boot API.
// Only static segment metadata lives here for use in the admin UI.

export type SegmentKey = "all" | "travelers" | "hosts" | "pending_applications" | "inactive";

export const SEGMENTS: Record<SegmentKey, { label: string; description: string }> = {
  all:                  { label: "All members", description: "Every approved member who hasn't opted out of marketing emails" },
  travelers:            { label: "Travelers", description: "Approved members with the traveler role" },
  hosts:                { label: "Hosts", description: "Approved members who run a business or have hosted an experience" },
  pending_applications: { label: "Pending applicants", description: "Applicants who are still awaiting a decision" },
  inactive:             { label: "Inactive members", description: "Approved members with no booking in the last 90 days" },
};

import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { Planner } from "@/components/planner/planner";

export const metadata: Metadata = {
  title: "Trip planner",
  description:
    "Plan a journey on the map: add stops, group them into days, and see the route and travel time for every leg.",
};

export default async function PlannerPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const [session, { plan }] = await Promise.all([getSession(), searchParams]);
  return <Planner signedIn={!!session} initialPlanId={plan ?? null} />;
}

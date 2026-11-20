import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { CityHub } from "@/components/play/city-hub";

export const metadata: Metadata = {
  title: "Play the city",
  description: "Your journey through the city's history: levels in walking order, split across your days.",
};

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const [session, { city }] = await Promise.all([getSession(), params]);
  return <CityHub key={city} cityId={city} signedIn={!!session} />;
}

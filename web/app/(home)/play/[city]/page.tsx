import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { getLang } from "@/lib/i18n/server";
import { CityHub } from "@/components/play/city-hub";

export const metadata: Metadata = {
  title: "Play the city",
  description: "Your journey through the city's history: levels in walking order, split across your days.",
};

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const [session, lang, { city }] = await Promise.all([getSession(), getLang(), params]);
  return <CityHub key={`${city}-${lang}`} cityId={city} signedIn={!!session} />;
}

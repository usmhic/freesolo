import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { getLang } from "@/lib/i18n/server";
import { RankingScreen } from "@/components/play/ranking-screen";

export const metadata: Metadata = {
  title: "Global ranking",
  description: "The players who've solved the most history missions — all time and this week.",
};

export default async function RankingPage() {
  const [session, lang] = await Promise.all([getSession(), getLang()]);
  return <RankingScreen key={lang} signedIn={!!session} />;
}

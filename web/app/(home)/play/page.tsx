import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { getLang } from "@/lib/i18n/server";
import { PlayGallery } from "@/components/play/play-gallery";

export const metadata: Metadata = {
  title: "Play a city",
  description: "Pick a city — Tangier, Porto, Córdoba, Rotterdam or Salzburg — and play its history as levels you solve on the spot.",
};

export default async function PlayPage() {
  const [session, lang] = await Promise.all([getSession(), getLang()]);
  return <PlayGallery key={lang} signedIn={!!session} />;
}

import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { PlayGallery } from "@/components/play/play-gallery";

export const metadata: Metadata = {
  title: "Play a city",
  description: "Pick a city — Tangier, Porto, Córdoba, Rotterdam or Salzburg — and play its history as levels you solve on the spot.",
};

export default async function PlayPage() {
  const session = await getSession();
  return <PlayGallery signedIn={!!session} />;
}

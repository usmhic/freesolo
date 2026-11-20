import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { PlayHome } from "@/components/play/play-home";

export const metadata: Metadata = {
  title: "Play a city",
  description: "Tell us where you're travelling and get a walk of history levels: short lessons you solve on the spot.",
};

export default async function PlayPage() {
  const session = await getSession();
  return <PlayHome signedIn={!!session} />;
}

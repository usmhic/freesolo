import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { SkyScreen } from "@/components/play/sky-screen";

export const metadata: Metadata = {
  title: "My sky",
  description: "Your star rank, your stardust, and a night sky of every history level you've solved.",
};

export default async function SkyPage() {
  const session = await getSession();
  return <SkyScreen signedIn={!!session} />;
}

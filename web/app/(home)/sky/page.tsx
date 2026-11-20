import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { getLang } from "@/lib/i18n/server";
import { SkyScreen } from "@/components/play/sky-screen";

export const metadata: Metadata = {
  title: "My sky",
  description: "Your star rank, your stardust, and a night sky of every history level you've solved.",
};

export default async function SkyPage() {
  const [session, lang] = await Promise.all([getSession(), getLang()]);
  return <SkyScreen key={lang} signedIn={!!session} />;
}

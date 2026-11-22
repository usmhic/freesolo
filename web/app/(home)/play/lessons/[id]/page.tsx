import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { getLang } from "@/lib/i18n/server";
import { LessonScreen } from "@/components/play/lesson-screen";

export const metadata: Metadata = {
  title: "Level",
  description: "A history lesson you solve on the spot.",
};

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const [session, lang, { id }] = await Promise.all([getSession(), getLang(), params]);
  return <LessonScreen key={`${id}-${lang}`} lessonId={id} signedIn={!!session} />;
}

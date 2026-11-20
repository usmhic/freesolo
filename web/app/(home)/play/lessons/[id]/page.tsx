import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { LessonScreen } from "@/components/play/lesson-screen";

export const metadata: Metadata = {
  title: "Level",
  description: "A history lesson you solve on the spot.",
};

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const [session, { id }] = await Promise.all([getSession(), params]);
  return <LessonScreen key={id} lessonId={id} signedIn={!!session} />;
}

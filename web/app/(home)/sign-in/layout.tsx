import type { ReactNode } from "react";
import { EnglishOnly } from "@/components/site/english-only";

/** Not translated yet: English, left to right. */
export default function Layout({ children }: { children: ReactNode }) {
  return <EnglishOnly>{children}</EnglishOnly>;
}

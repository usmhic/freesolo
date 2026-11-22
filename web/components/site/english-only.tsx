import type { ReactNode } from "react";

/**
 * Pages that are not translated yet: keep them English and left to right
 * inside the localized header and footer, so Arabic doesn't mirror English text.
 */
export function EnglishOnly({ children }: { children: ReactNode }) {
  return (
    <div lang="en" dir="ltr" className="contents">
      {children}
    </div>
  );
}

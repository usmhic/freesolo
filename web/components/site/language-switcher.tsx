"use client";

import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { cn } from "@/lib/cn";
import { LANG_COOKIE, LANG_NAMES, LANGS, type Lang } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";

/** Picks the site language; the choice is kept in a cookie for a year. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, t } = useI18n();
  const router = useRouter();

  function choose(next: Lang) {
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <label className={cn("relative inline-flex items-center", className)}>
      <span className="sr-only">{t.common.language}</span>
      <Languages aria-hidden className="pointer-events-none absolute start-2.5 size-4 text-ink-soft" />
      <select
        value={lang}
        onChange={(e) => choose(e.target.value as Lang)}
        className="h-9 cursor-pointer appearance-none rounded-full border border-line bg-surface ps-8 pe-3 text-sm font-medium text-ink outline-none transition hover:border-ink-soft/50 focus-visible:ring-2 focus-visible:ring-sunset"
      >
        {LANGS.map((l) => (
          <option key={l} value={l}>{LANG_NAMES[l]}</option>
        ))}
      </select>
    </label>
  );
}

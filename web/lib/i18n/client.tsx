"use client";

import { createContext, useContext, useMemo } from "react";
import { fill, LOCALES, type Lang } from "./config";
import type { Dict } from "./dictionaries/en";

type I18n = {
  lang: Lang;
  t: Dict;
  /** Number in the visitor's locale. */
  num: (n: number) => string;
  /** Short date ("Tue 3 Dec") in the visitor's locale. */
  day: (d: Date) => string;
  fill: typeof fill;
};

const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ lang, dict, children }: { lang: Lang; dict: Dict; children: React.ReactNode }) {
  const value = useMemo<I18n>(() => {
    const numbers = new Intl.NumberFormat(LOCALES[lang]);
    const dates = new Intl.DateTimeFormat(LOCALES[lang], { weekday: "short", day: "numeric", month: "short" });
    return { lang, t: dict, num: (n) => numbers.format(n), day: (d) => dates.format(d), fill };
  }, [lang, dict]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n must be used inside <I18nProvider>");
  return v;
}

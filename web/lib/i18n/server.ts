import { cookies, headers } from "next/headers";
import { cache } from "react";
import { DEFAULT_LANG, isLang, LANG_COOKIE, LANGS, type Lang } from "./config";
import type { Dict } from "./dictionaries/en";

const DICTIONARIES: Record<Lang, () => Promise<Dict>> = {
  en: () => import("./dictionaries/en").then((m) => m.default),
  fr: () => import("./dictionaries/fr").then((m) => m.default),
  es: () => import("./dictionaries/es").then((m) => m.default),
  ar: () => import("./dictionaries/ar").then((m) => m.default),
};

/** The visitor's language: their saved choice, then their browser's, then English. */
export const getLang = cache(async (): Promise<Lang> => {
  const saved = (await cookies()).get(LANG_COOKIE)?.value;
  if (isLang(saved)) return saved;
  const accept = (await headers()).get("accept-language") ?? "";
  for (const part of accept.split(",")) {
    const base = part.split(";")[0].trim().toLowerCase().split("-")[0];
    if ((LANGS as readonly string[]).includes(base)) return base as Lang;
  }
  return DEFAULT_LANG;
});

export const getDictionary = cache(async (lang: Lang): Promise<Dict> => DICTIONARIES[lang]());

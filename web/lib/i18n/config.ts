/** The languages FreeSolo speaks. Keep in step with the API's Languages.SUPPORTED. */
export const LANGS = ["en", "fr", "es", "ar"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";
export const LANG_COOKIE = "freesolo-lang";

export const LANG_NAMES: Record<Lang, string> = { en: "English", fr: "Français", es: "Español", ar: "العربية" };

/** Locale for dates, numbers and speech. Arabic keeps Western digits, as in Morocco. */
export const LOCALES: Record<Lang, string> = { en: "en-GB", fr: "fr-FR", es: "es-ES", ar: "ar-MA" };

export const isLang = (v: unknown): v is Lang => typeof v === "string" && (LANGS as readonly string[]).includes(v);
export const isRtl = (lang: Lang) => lang === "ar";

/** "Solve {n} missions" + { n: 3 } → "Solve 3 missions". */
export function fill(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

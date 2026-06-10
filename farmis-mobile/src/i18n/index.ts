import { bik } from "./locales/bik";
import { ceb } from "./locales/ceb";
import { en } from "./locales/en";
import { fil } from "./locales/fil";
import { hil } from "./locales/hil";
import { ilo } from "./locales/ilo";
import type { Locale, TranslationValues, Translations } from "./types";

export type { Locale, TranslationValues, Translations };
export { en };

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALES: Locale[] = ["en", "fil", "ceb", "ilo", "hil", "bik"];

const translations: Record<Locale, Translations> = {
  en,
  fil,
  ceb,
  ilo,
  hil,
  bik,
};

export function getTranslations(locale: Locale): Translations {
  return translations[locale] ?? translations[DEFAULT_LOCALE];
}

type TranslationPath =
  | `common.${keyof Translations["common"]}`
  | `onboarding.${keyof Translations["onboarding"]}`
  | `dashboard.${keyof Translations["dashboard"]}`
  | `reports.${keyof Translations["reports"]}`
  | `situationReport.${Exclude<keyof Translations["situationReport"], "incidents" | "status">}`
  | `situationReport.incidents.${keyof Translations["situationReport"]["incidents"]}`
  | `situationReport.status.${keyof Translations["situationReport"]["status"]}`
  | `cropHarvest.${Exclude<keyof Translations["cropHarvest"], "cropTypes">}`
  | `cropHarvest.cropTypes.${keyof Translations["cropHarvest"]["cropTypes"]}`
  | `categories.${keyof Translations["categories"]}`
  | `tabs.${keyof Translations["tabs"]}`
  | `notifications.${Exclude<keyof Translations["notifications"], "items" | "time">}`
  | `notifications.time.${keyof Translations["notifications"]["time"]}`
  | `notifications.items.assistanceProgram.${"title" | "bodyNamed"}`
  | `notifications.items.cropRecord.${"title" | "bodyNamed"}`
  | `notifications.items.assistanceDistribution.${"title" | "bodyNamed"}`
  | `accessibility.${keyof Translations["accessibility"]}`
  | `profile.${keyof Translations["profile"]}`
  | `assistance.${Exclude<keyof Translations["assistance"], "status">}`
  | `assistance.status.${keyof Translations["assistance"]["status"]}`;

function getNestedValue(obj: unknown, path: string): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : undefined;
}

export function translate(
  locale: Locale,
  key: TranslationPath,
  values?: TranslationValues,
): string {
  const template = getNestedValue(getTranslations(locale), key) ?? key;
  if (!values) {
    return template;
  }
  return Object.entries(values).reduce(
    (result, [name, value]) => result.replaceAll(`{{${name}}}`, String(value)),
    template,
  );
}

export type TranslateFn = (
  key: TranslationPath,
  values?: TranslationValues,
) => string;

export function createTranslate(locale: Locale): TranslateFn {
  return (key, values) => translate(locale, key, values);
}

import { configureLocalization } from "@lit/localize";
import {
  allLocales,
  sourceLocale,
  targetLocales,
} from "../../generated/locale-codes.js";

type LocaleModule = { templates: Record<string, string> };

/** Lazy locale modules produced by `npm run localize:build`; empty outside Vite/Rollup glob. */
const localeModules: Record<string, () => Promise<LocaleModule>> =
  typeof import.meta.glob === "function"
    ? import.meta.glob<LocaleModule>("../../generated/locales/*.ts")
    : {};

const loadLocale = (locale: string) => {
  if (locale === sourceLocale) {
    return Promise.resolve({ templates: {} });
  }
  const entry = Object.entries(localeModules).find(
    ([path]) => path.endsWith(`/${locale}.ts`) || path.endsWith(`/${locale}.js`),
  );
  if (!entry) {
    return Promise.reject(new Error(`Invalid locale code`));
  }
  return entry[1]();
};

const { getLocale, setLocale } = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale,
});

export { allLocales, getLocale, setLocale, sourceLocale, targetLocales };

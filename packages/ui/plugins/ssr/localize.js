import { configureLocalization } from "@lit/localize";

/** Node/webpack-safe stub — dist `lit-localize-runtime` uses Vite `import.meta.glob`. */
const sourceLocale = "en";
const targetLocales = ["de", "es", "fr"];
const allLocales = ["de", "en", "es", "fr"];

const loadLocale = (locale) => {
  if (locale === sourceLocale) return Promise.resolve({ templates: {} });
  return Promise.reject(new Error("Invalid locale code"));
};

const { getLocale, setLocale } = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale,
});

export { allLocales, getLocale, setLocale, sourceLocale, targetLocales };

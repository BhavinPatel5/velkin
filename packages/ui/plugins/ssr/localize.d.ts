export const sourceLocale: string;
export const targetLocales: readonly string[];
export const allLocales: readonly string[];
export function getLocale(): string;
export function setLocale(locale: string): Promise<void>;

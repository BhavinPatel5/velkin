import { getCachedAsync } from "./cache.js";

export const VELKIN_DOCS_SITE_BASE_URL_ENV = "VELKIN_DOCS_SITE_BASE_URL";
export const VELKIN_DOCS_SITE_DISABLE_ENV = "VELKIN_DOCS_SITE_DISABLE";
export const DEFAULT_VELKIN_DOCS_SITE_BASE_URL = "https://mcp.velkinui.com";

const MAX_BYTES = 800_000;
const TIMEOUT_MS = 20_000;

export function resolveDocsSiteBaseUrl(): string | null {
  if (process.env[VELKIN_DOCS_SITE_DISABLE_ENV]?.trim() === "1") return null;
  const raw = process.env[VELKIN_DOCS_SITE_BASE_URL_ENV]?.trim();
  return raw || DEFAULT_VELKIN_DOCS_SITE_BASE_URL;
}

export type DocsSiteComponentPayload = {
  schema: string;
  id: string;
  tag: string;
  docsUrl?: string;
  snippets?: { react?: string | null; lit?: string; vue?: string };
  agentHints?: string[];
  related?: string[];
  dependencies?: string[];
  description?: string;
};

export type FetchResult =
  | { ok: true; url: string; body: DocsSiteComponentPayload }
  | { ok: false; error: string; httpStatus?: number };

async function fetchJson<T>(url: string): Promise<{ ok: true; data: T } | { ok: false; error: string; status?: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}`, status: res.status };
    }
    const text = await res.text();
    if (text.length > MAX_BYTES) {
      return { ok: false, error: `Response exceeds ${MAX_BYTES} bytes` };
    }
    return { ok: true, data: JSON.parse(text) as T };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timer);
  }
}

export function fetchDocsSiteComponent(slug: string): Promise<FetchResult> {
  const base = resolveDocsSiteBaseUrl();
  if (!base) return Promise.resolve({ ok: false, error: "Docs site fetch disabled" });

  const cacheKey = `docs-site:${base}:${slug}`;
  return getCachedAsync(cacheKey, 300_000, async () => {
    const url = new URL(`/mcp/component/${encodeURIComponent(slug)}`, base.endsWith("/") ? base : `${base}/`);
    const result = await fetchJson<DocsSiteComponentPayload>(url.href);
    if (!result.ok) {
      return { ok: false as const, error: result.error, httpStatus: result.status };
    }
    return { ok: true as const, url: url.href, body: result.data };
  });
}

export type ManifestPayload = {
  schema: string;
  componentCount: number;
  components: Array<{ id: string; tag: string; tier: string; summary: string }>;
};

export async function fetchDocsSiteManifest(): Promise<
  { ok: true; url: string; body: ManifestPayload } | { ok: false; error: string }
> {
  const base = resolveDocsSiteBaseUrl();
  if (!base) return { ok: false, error: "Docs site fetch disabled" };
  const url = new URL("/mcp/manifest", base.endsWith("/") ? base : `${base}/`);
  const result = await fetchJson<ManifestPayload>(url.href);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, url: url.href, body: result.data };
}

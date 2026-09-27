import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { getCached } from "./cache.js";

export type VelkinComponentTier = "free" | "pro";

export type VelkinComponentEntry = {
  tag: string;
  slug: string;
  name: string;
  category?: string;
  tier: VelkinComponentTier;
  status?: string;
  since?: string | null;
  litImport: string;
  reactImport: string | null;
  vueImport: string;
  hasReact: boolean;
  summary: string;
  snippets?: { react?: string | null; lit?: string; vue?: string };
};

export type ResolvedComponent = {
  entry: VelkinComponentEntry;
  match: "exact" | "fuzzy";
  requested: string;
};

export function mcpPackageRoot(): string {
  try {
    const req = createRequire(import.meta.url);
    return dirname(req.resolve("@velkin/mcp/package.json"));
  } catch {
    const here = dirname(fileURLToPath(import.meta.url));
    return join(here, "..");
  }
}

function requireFromHere() {
  return createRequire(import.meta.url);
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function resolvePackageRoot(packageName: string, envVar: string | undefined, monorepoFolder: string): string | null {
  const envRoot = envVar?.trim();
  if (envRoot && existsSync(join(resolve(envRoot), "package.json"))) {
    return resolve(envRoot);
  }
  try {
    const req = requireFromHere();
    const resolved = req.resolve(`${packageName}/package.json`);
    return dirname(resolved);
  } catch {
    const mono = join(mcpPackageRoot(), "..", monorepoFolder);
    if (existsSync(join(mono, "package.json"))) return mono;
    return null;
  }
}

export function resolveCorePackageRoot(): string | null {
  return resolvePackageRoot("@velkin/ui", process.env.VELKIN_UI_PACKAGE_ROOT, "ui");
}

export function resolveProPackageRoot(): string | null {
  return resolvePackageRoot("@velkin/ui-pro", process.env.VELKIN_UI_PRO_PACKAGE_ROOT, "ui-pro");
}

export function getMainPackageVersion(): string | null {
  const root = resolveCorePackageRoot();
  if (!root) return null;
  try {
    const pkg = readJson(join(root, "package.json")) as { version?: string };
    return pkg.version ?? null;
  } catch {
    return null;
  }
}

function loadSnapshot(): { components: VelkinComponentEntry[]; generatedAt: string } {
  const snapPath = join(mcpPackageRoot(), "data/docs-snapshot.json");
  if (!existsSync(snapPath)) {
    throw new Error("Missing data/docs-snapshot.json — run: npm run build --workspace=@velkin/mcp");
  }
  const raw = readJson(snapPath) as { components: VelkinComponentEntry[]; generatedAt: string };
  return raw;
}

export function loadVelkinComponentsCached(): VelkinComponentEntry[] {
  return getCached("velkin-components", 60_000, () => loadSnapshot().components);
}

export function normalizeComponentKey(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^@velkin\/(ui|react|vue)\//, "")
    .replace(/^vu-/, "")
    .replace(/[^a-z0-9-]/g, "");
}

export function resolveComponentEntry(query: string): ResolvedComponent | null {
  const key = normalizeComponentKey(query);
  const components = loadVelkinComponentsCached();
  const exact = components.find((c) => c.slug === key || c.tag === `vu-${key}` || c.tag === query);
  if (exact) return { entry: exact, match: "exact", requested: query };
  const fuzzy = components.find(
    (c) => c.slug.includes(key) || c.name.toLowerCase().includes(key) || c.tag.includes(key),
  );
  if (fuzzy) return { entry: fuzzy, match: "fuzzy", requested: query };
  return null;
}

export function listComponentExportsFromPackage(packageRoot: string): string[] {
  const pkg = readJson(join(packageRoot, "package.json")) as { exports?: Record<string, unknown> };
  const exports = pkg.exports ?? {};
  return Object.keys(exports)
    .filter((k) => k.startsWith("./") && !k.includes("*") && k !== "./")
    .map((k) => k.slice(2))
    .filter((k) => !["vite", "webpack", "rollup", "auto-import", "custom-elements.json", "all"].includes(k))
    .sort();
}

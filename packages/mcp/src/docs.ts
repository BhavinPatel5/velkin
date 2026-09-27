import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { mcpPackageRoot } from "./catalog.js";

export type DocsApiTables = {
  summary?: string;
  meta?: Array<{ label: string; value: string }>;
  props?: Array<{ name: string; type: string; typeExpanded?: string; default: string; description: string }>;
  slots?: Array<{ name: string; description: string }>;
  parts?: Array<{ name: string; description: string }>;
  cssProps?: Array<{ name: string; description: string }>;
  events?: Array<{ name: string; type: string; typeExpanded?: string; description: string }>;
  methods?: Array<{ name: string; description: string }>;
  typeDefs?: Array<{ name: string; definition: string }>;
};

export type ComponentDocumentation = {
  tag: string;
  slug: string;
  name: string;
  category?: string;
  tier: "free" | "pro";
  summary: string;
  litImport: string;
  reactImport: string | null;
  vueImport: string;
  hasReact: boolean;
  api: DocsApiTables;
  dataSource: "snapshot" | "live";
  dependencies?: string[];
  agentHints?: string[];
  snippets?: { react?: string | null; lit?: string; vue?: string };
  docsUrl?: string;
};

function loadSnapshotComponents(): ComponentDocumentation[] {
  const path = join(mcpPackageRoot(), "data/docs-snapshot.json");
  const raw = JSON.parse(readFileSync(path, "utf8")) as { components: ComponentDocumentation[] };
  return raw.components.map((c) => ({ ...c, dataSource: "snapshot" as const }));
}

export function getVelkinComponentDocs(name: string): ComponentDocumentation | null {
  const components = loadSnapshotComponents();
  const key = name.trim().toLowerCase().replace(/^vu-/, "").replace(/^@velkin\/(ui|react|vue)\//, "");
  return (
    components.find((c) => c.slug === key || c.tag === name || c.tag === `vu-${key}`) ?? null
  );
}

export function getVelkinComponentDocsBatch(names: string[]): ComponentDocumentation[] {
  return names.map((n) => getVelkinComponentDocs(n)).filter((d): d is ComponentDocumentation => d !== null);
}

export function listAllComponentDocs(): ComponentDocumentation[] {
  return loadSnapshotComponents();
}

export function searchVelkinComponents(query: string, limit = 20): ComponentDocumentation[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return loadSnapshotComponents()
    .filter(
      (c) =>
        c.slug.includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.tag.includes(q) ||
        c.summary.toLowerCase().includes(q),
    )
    .slice(0, limit);
}

export function searchComponentsByApi(keyword: string, limit = 20): Array<{ slug: string; tag: string; matches: string[] }> {
  const q = keyword.trim().toLowerCase();
  if (!q) return [];
  const results: Array<{ slug: string; tag: string; matches: string[] }> = [];
  for (const c of loadSnapshotComponents()) {
    const matches: string[] = [];
    for (const p of c.api.props ?? []) {
      if (p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q)) matches.push(`prop:${p.name}`);
    }
    for (const e of c.api.events ?? []) {
      if (e.name.toLowerCase().includes(q)) matches.push(`event:${e.name}`);
    }
    for (const s of c.api.slots ?? []) {
      if (s.name.toLowerCase().includes(q)) matches.push(`slot:${s.name}`);
    }
    for (const m of c.api.methods ?? []) {
      if (m.name.toLowerCase().includes(q)) matches.push(`method:${m.name}`);
    }
    if (matches.length) results.push({ slug: c.slug, tag: c.tag, matches });
    if (results.length >= limit) break;
  }
  return results;
}

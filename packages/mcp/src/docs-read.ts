import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, resolve, relative } from "node:path";
import { mcpPackageRoot } from "./catalog.js";

const DOCS_DIR = join(mcpPackageRoot(), "docs");

export function listDocsPaths(): string[] {
  if (!existsSync(DOCS_DIR)) return [];
  return readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();
}

export function getDocsPage(filename: string): { path: string; content: string } | null {
  const safe = filename.replace(/\\/g, "/").replace(/^\/+/, "");
  if (safe.includes("..")) return null;
  const abs = resolve(DOCS_DIR, safe);
  const rel = relative(DOCS_DIR, abs);
  if (rel.startsWith("..")) return null;
  if (!existsSync(abs)) return null;
  return { path: safe, content: readFileSync(abs, "utf8") };
}

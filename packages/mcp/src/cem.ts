import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { mcpPackageRoot, resolveCorePackageRoot } from "./catalog.js";

export function readCustomElementsManifest(): unknown | null {
  const coreRoot = resolveCorePackageRoot();
  if (coreRoot) {
    const live = join(coreRoot, "dist/custom-elements.json");
    if (existsSync(live)) {
      return JSON.parse(readFileSync(live, "utf8"));
    }
  }
  return null;
}

/** Load CEM from MCP client workspace roots (installed @velkin/ui or monorepo dist). */
export function readCustomElementsManifestFromRoots(
  roots: Array<{ uri: string; name?: string }>,
): unknown | null {
  for (const root of roots) {
    if (!root.uri?.startsWith("file:")) continue;
    let dir: string;
    try {
      dir = fileURLToPath(root.uri);
    } catch {
      continue;
    }
    const candidates = [
      join(dir, "node_modules/@velkin/ui/dist/custom-elements.json"),
      join(dir, "packages/core/dist/custom-elements.json"),
      join(dir, "dist/custom-elements.json"),
    ];
    for (const p of candidates) {
      if (existsSync(p)) return JSON.parse(readFileSync(p, "utf8"));
    }
  }
  return null;
}

export function readCustomElementsManifestText(): string {
  const manifest = readCustomElementsManifest();
  if (manifest) return JSON.stringify(manifest, null, 2);
  return JSON.stringify({ error: "custom-elements.json not found — build @velkin/ui first" }, null, 2);
}

export function isCemManifestPresent(): boolean {
  return readCustomElementsManifest() !== null;
}

export function readDocsSnapshotText(): string {
  const path = join(mcpPackageRoot(), "data/docs-snapshot.json");
  return readFileSync(path, "utf8");
}

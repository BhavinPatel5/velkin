import {
  getMainPackageVersion,
  loadVelkinComponentsCached,
  resolveCorePackageRoot,
} from "./catalog.js";
import { isCemManifestPresent } from "./cem.js";
import { READ_ONLY_TOOL_NAMES } from "./read-only-tool-allowlist.js";
import { resolveDocsSiteBaseUrl } from "./docs-site-fetch.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { mcpPackageRoot } from "./catalog.js";

export function getMcpRuntimeStatus() {
  const coreRoot = resolveCorePackageRoot();
  const components = loadVelkinComponentsCached();
  let version = "0.0.0";
  try {
    const pkg = JSON.parse(readFileSync(join(mcpPackageRoot(), "package.json"), "utf8")) as { version?: string };
    version = pkg.version ?? version;
  } catch {
    /* ignore */
  }

  const remediation: string[] = [];
  if (!coreRoot) remediation.push("Install peer @velkin/ui alongside @velkin/mcp");
  if (!isCemManifestPresent()) remediation.push("Build @velkin/ui to generate dist/custom-elements.json");

  return {
    ok: true,
    version,
    toolCount: READ_ONLY_TOOL_NAMES.length,
    tools: [...READ_ONLY_TOOL_NAMES],
    docsSite: {
      enabled: resolveDocsSiteBaseUrl() !== null,
      baseUrl: resolveDocsSiteBaseUrl(),
      disableEnv: "VELKIN_DOCS_SITE_DISABLE=1",
      baseUrlEnv: "VELKIN_DOCS_SITE_BASE_URL",
    },
    core: {
      resolved: Boolean(coreRoot),
      version: getMainPackageVersion(),
      docsReady: components.length > 0,
      componentCount: components.length,
      cemPresent: isCemManifestPresent(),
    },
    remediation,
  };
}

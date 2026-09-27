/**
 * Vite plugin for @velkin/ui.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Components from "unplugin-vue-components/vite";
import type { Plugin } from "vite";
import { VELKIN_UI_TAG_NAMES, getCoreImportPath, VelkinUIMainResolver } from "../auto-import.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CORE_DIST = path.resolve(__dirname, "..", "dist");

const VIRTUAL_ID = "\0velkin-ui-core-auto-import";
const VIRTUAL_ID_QUERY = "virtual:velkin-ui-core-auto-import";

const TAG_RE = /<(vu-[a-z][a-z0-9]*(?:-[a-z0-9]+)*)|['"`](vu-[a-z][a-z0-9]*(?:-[a-z0-9]+)*)['"`]/gi;

function extractUsedTagNames(content: string): Set<string> {
  const used = new Set<string>();
  let m: RegExpExecArray | null;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(content)) !== null) {
    const tag = (m[1] || m[2] || "").toLowerCase();
    if (VELKIN_UI_TAG_NAMES.has(tag)) used.add(tag);
  }
  return used;
}

export interface VelkinAutoImportOptions {
  packageName?: string;
  entryHtml?: string;
  entryScript?: string | null;
  treeShake?: boolean;
}

export interface VelkinComponentsOptions {
  resolverOptions?: Record<string, unknown>;
  dts?: boolean;
  componentsOptions?: Record<string, unknown>;
}

export interface VelkinPluginOptions extends VelkinAutoImportOptions {
  mode?: "vue" | "auto-import";
  resolverOptions?: Record<string, unknown>;
  dts?: boolean;
  componentsOptions?: Record<string, unknown>;
}

function coreAutoImportVitePlugin(options: VelkinAutoImportOptions = {}): Plugin {
  const packageName = options.packageName ?? "@velkin/ui";
  const entryHtml = options.entryHtml ?? "index.html";
  const entryScript = options.entryScript ?? null;
  const treeShake = options.treeShake !== false;

  let resolvedEntryPath: string | null = null;
  let generatedImports = "";

  return {
    name: "velkin-ui-core-auto-import",
    enforce: "pre",
    configResolved(config) {
      const root = config.root || process.cwd();
      const htmlPath = path.resolve(root, entryHtml);
      if (!fs.existsSync(htmlPath)) return;

      const html = fs.readFileSync(htmlPath, "utf-8");
      const used = new Set(extractUsedTagNames(html));

      let scriptPath: string | null = null;
      if (entryScript) {
        scriptPath = path.resolve(root, entryScript);
      } else {
        const scriptMatch = html.match(
          /<script[^>]+type\s*=\s*["']module["'][^>]+src\s*=\s*["']([^"']+)["']/,
        );
        if (scriptMatch) {
          const src = scriptMatch[1].replace(/^\//, "");
          scriptPath = path.resolve(root, src);
        }
      }

      if (scriptPath && fs.existsSync(scriptPath)) {
        const js = fs.readFileSync(scriptPath, "utf-8");
        extractUsedTagNames(js).forEach((t) => used.add(t));
        resolvedEntryPath = path.normalize(scriptPath);
      }

      if (!treeShake) {
        generatedImports = `/** Whole library: @velkin/ui/all */\nimport '${packageName}/all';\n`;
      } else {
        const imports = [...used]
          .map((tag) => getCoreImportPath(tag, packageName))
          .filter(Boolean)
          .map((p) => `import '${p}';`)
          .join("\n");
        generatedImports = imports
          ? `/** Auto-imported by @velkin/ui (only used components) */\n${imports}\n`
          : "";
      }
    },
    resolveId(id) {
      if (id === VIRTUAL_ID_QUERY || id === VIRTUAL_ID) return VIRTUAL_ID;
      if (id.startsWith("@velkin/ui/")) {
        const subpath = id.slice("@velkin/ui/".length);
        const full = path.join(CORE_DIST, subpath);
        if (fs.existsSync(full)) return full;
      }
      return null;
    },
    load(id) {
      if (id !== VIRTUAL_ID) return null;
      return generatedImports;
    },
    transform(code, id) {
      if (!resolvedEntryPath || !generatedImports) return null;
      const normalizedId = path.normalize(id);
      if (normalizedId !== resolvedEntryPath) return null;
      return {
        code: `import '${VIRTUAL_ID_QUERY}';\n${code}`,
        map: null,
      };
    },
  };
}

function coreVueComponentsVitePlugin(options: VelkinComponentsOptions = {}): Plugin {
  return Components({
    resolvers: [VelkinUIMainResolver(options.resolverOptions ?? {})],
    dts: options.dts !== false,
    ...options.componentsOptions,
  }) as Plugin;
}

export function velkin(options: VelkinPluginOptions = {}): Plugin | Plugin[] {
  const { mode = "vue", ...rest } = options;
  if (mode === "auto-import") {
    return coreAutoImportVitePlugin(rest);
  }
  return coreVueComponentsVitePlugin(rest);
}

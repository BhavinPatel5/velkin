// plugins/rollup-plugin.ts
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
var VIRTUAL_ID = "\0velkin-ui-core-auto-import";
var VIRTUAL_QUERY = "virtual:velkin-ui-core-auto-import";
var TAG_RE = /<(vu-[a-z][a-z0-9]*(?:-[a-z0-9]+)*)|['"`](vu-[a-z][a-z0-9]*(?:-[a-z0-9]+)*)['"`]/gi;
function isCoreModule(id) {
  const n = id.replace(/\\/g, "/");
  return n.includes("@velkin/ui") || n.includes("node_modules/@velkin/ui") || n.includes("packages/core");
}
function coreRollupSideEffectsPlugin(options = {}) {
  const treeShake = options.treeShake !== false;
  return {
    name: "velkin",
    options(inputOptions) {
      if (!treeShake) return;
      const prev = inputOptions.treeshake;
      const prevSideEffects = typeof prev === "object" && prev !== null && prev.moduleSideEffects;
      inputOptions.treeshake = {
        ...typeof prev === "object" && prev !== null ? prev : {},
        moduleSideEffects(id) {
          if (isCoreModule(id)) return true;
          if (typeof prevSideEffects === "function") return prevSideEffects(id, false);
          if (Array.isArray(prevSideEffects)) return prevSideEffects.some((s) => id.includes(s));
          return prevSideEffects !== false;
        }
      };
    },
    transform(_, id) {
      if (!treeShake) return null;
      if (isCoreModule(id)) return { moduleSideEffects: true };
      return null;
    }
  };
}
function extractUsedTagNames(content, tagNamesSet) {
  const used = /* @__PURE__ */ new Set();
  let m;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(content)) !== null) {
    const tag = (m[1] || m[2] || "").toLowerCase();
    if (tagNamesSet.has(tag)) used.add(tag);
  }
  return used;
}
function coreAutoImportRollupPlugin(options = {}) {
  const packageName = options.packageName ?? "@velkin/ui";
  const entryHtml = options.entryHtml ?? "index.html";
  let entryPath = options.entryPath ?? null;
  let generatedImports = "";
  return {
    name: "velkin-ui-core-auto-import-rollup",
    options(inputOptions) {
      if (entryPath) return;
      const input = inputOptions.input;
      if (typeof input === "string") entryPath = path.resolve(input);
      else if (Array.isArray(input) && input.length) entryPath = path.resolve(input[0]);
      else if (input && typeof input === "object") {
        const first = Object.values(input)[0];
        if (typeof first === "string") entryPath = path.resolve(first);
      }
    },
    async buildStart() {
      if (!entryPath) return;
      const entryDir = path.dirname(entryPath);
      const htmlPath = path.resolve(entryDir, "..", entryHtml);
      const pluginDir = path.dirname(fileURLToPath(import.meta.url));
      const autoImportPath = path.resolve(pluginDir, "..", "auto-import.js");
      const { VELKIN_UI_TAG_NAMES } = await import(pathToFileURL(autoImportPath).href);
      const used = /* @__PURE__ */ new Set();
      if (fs.existsSync(htmlPath)) {
        const html = fs.readFileSync(htmlPath, "utf-8");
        extractUsedTagNames(html, VELKIN_UI_TAG_NAMES).forEach((t) => used.add(t));
      }
      if (fs.existsSync(entryPath)) {
        const js = fs.readFileSync(entryPath, "utf-8");
        extractUsedTagNames(js, VELKIN_UI_TAG_NAMES).forEach((t) => used.add(t));
      }
      const imports = [...used].sort().map((tag) => `import '${packageName}/${tag}';`).join("\n");
      generatedImports = imports ? `/** Auto-imported by @velkin/ui */
${imports}
` : "";
    },
    resolveId(id) {
      if (id === VIRTUAL_QUERY || id === VIRTUAL_ID) return VIRTUAL_ID;
      return null;
    },
    load(id) {
      if (id !== VIRTUAL_ID) return null;
      return generatedImports;
    },
    transform(code, id) {
      if (!entryPath) return null;
      const normalized = path.normalize(id);
      if (normalized !== path.normalize(entryPath)) return null;
      return { code: `import '${VIRTUAL_QUERY}';
${code}`, map: null };
    }
  };
}
function velkin(options = {}) {
  const { mode = "default", ...rest } = options;
  if (mode === "auto-import") {
    return [coreAutoImportRollupPlugin(rest), coreRollupSideEffectsPlugin(rest)];
  }
  return coreRollupSideEffectsPlugin(rest);
}
export {
  velkin
};

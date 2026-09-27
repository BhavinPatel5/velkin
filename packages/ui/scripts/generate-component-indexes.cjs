/**
 * 1) Generates dist/<component>/index.js so that @velkin/ui/<component> resolves.
 * 2) Patches package.json exports with explicit ./<component> entries (Node resolves these;
 *    the "./*" pattern is not always applied for single-segment subpaths).
 * Run after rollup build.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");
const pkgPath = path.join(root, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

// Rollup tree-shakes pure re-export barrels under dist/internals/**/index.js while still
// emitting *.d.ts. Pro packages import those barrels — restore JS (strip `export type`).
const TYPE_EXPORT_RE =
  /export\s+type\s*(?:\{[\s\S]*?\}|[^\n]+)\s*(?:from\s*['"][^'"]+['"])?\s*;?\s*/g;
/** Strip `type Foo` members from mixed `export { value, type Foo }` lists for JS runtime. */
const INLINE_TYPE_MEMBER_RE = /(?:,\s*)?type\s+[A-Za-z_][\w.]*(?:\s+as\s+[A-Za-z_]\w*)?/g;

function stripTypeOnlyExports(text) {
  let out = text.replace(TYPE_EXPORT_RE, "");
  out = out.replace(INLINE_TYPE_MEMBER_RE, "");
  out = out
    .replace(/\{\s*,/g, "{")
    .replace(/,\s*,/g, ",")
    .replace(/,\s*\}/g, "\n}");
  return (
    out
      .split("\n")
      .filter((ln, i, arr) => {
        if (ln.trim()) return true;
        return i === 0 || arr[i - 1].trim() !== "";
      })
      .join("\n")
      .trimEnd() + "\n"
  );
}

function restoreInternalsBarrels() {
  const srcRoot = path.join(root, "src", "internals");
  const distRoot = path.join(dist, "internals");
  if (!fs.existsSync(srcRoot)) return;

  /** @param {string} dir @param {string[]} out */
  function walk(dir, out = []) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(p, out);
      else if (ent.name === "index.ts") out.push(p);
    }
    return out;
  }

  for (const src of walk(srcRoot)) {
    const rel = path.relative(srcRoot, src);
    const outFile = path.join(distRoot, rel.replace(/\.ts$/, ".js"));
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, stripTypeOnlyExports(fs.readFileSync(src, "utf8")));
  }
}

restoreInternalsBarrels();

// Rollup tree-shakes `localize.ts` (re-exports only) while still emitting localize.d.ts.
const localizeJs = path.join(dist, "internals", "utils", "localize.js");
const localizeDts = path.join(dist, "internals", "utils", "localize.d.ts");
if (!fs.existsSync(localizeJs) && fs.existsSync(localizeDts)) {
  fs.writeFileSync(
    localizeJs,
    [
      "/** Re-export Lit localize runtime configured for this repo. */",
      'export { msg, str, localized } from "@lit/localize";',
      "export {",
      "  allLocales,",
      "  getLocale,",
      "  setLocale,",
      "  sourceLocale,",
      "  targetLocales,",
      '} from "./lit-localize-runtime.js";',
      "",
    ].join("\n"),
  );
}

const SKIP_DIRS = new Set(["internals", "generated", "legacy"]);
/** Non-component export keys that must survive package.json rewrites. */
const FIXED_EXPORT_KEYS = new Set([
  ".",
  "./auto-import",
  "./custom-elements.json",
  "./all",
  "./vite",
  "./webpack",
  "./rollup",
]);
const { isProComponent } = require(path.join(root, "..", "..", "scripts", "component-tier.cjs"));

const dirs = fs
  .readdirSync(dist, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !SKIP_DIRS.has(d.name));
const componentExports = {};

for (const dir of dirs) {
  const name = dir.name;
  if (isProComponent(name)) {
    throw new Error(
      `@velkin/ui dist contains pro-tier folder "${name}" — run sync:core so pro stays in @velkin/ui-pro only.`,
    );
  }
  const indexJs = path.join(dist, name, "index.js");
  const componentJs = path.join(dist, name, `${name}.js`);
  const srcIndexTs = path.join(root, "src", name, "index.ts");
  if (fs.existsSync(srcIndexTs)) {
    // Rollup's `export *` flattening + tree-shaking drops re-exports from non-entry
    // barrels (e.g. notification loses VuNotificationProvider/notify). Rebuild the
    // barrel from the authoritative source index, keeping only `export *` lines whose
    // target module survives in dist (pure re-export modules get tree-shaken away, and
    // their symbols are re-exported by the surviving side-effecting modules).
    const lines = fs.readFileSync(srcIndexTs, "utf-8").split("\n");
    const kept = lines.filter((line) => {
      const m = line.match(/export\s+\*\s+from\s+["']\.\/(.+?)\.js["']/);
      if (!m) return false;
      return fs.existsSync(path.join(dist, name, `${m[1]}.js`));
    });
    if (kept.length > 0) {
      fs.writeFileSync(indexJs, kept.join("\n") + "\n");
    } else if (!fs.existsSync(indexJs) && fs.existsSync(componentJs)) {
      fs.writeFileSync(indexJs, `export * from './${name}.js';\n`);
    }
  } else if (!fs.existsSync(indexJs) && fs.existsSync(componentJs)) {
    fs.writeFileSync(indexJs, `export * from './${name}.js';\n`);
  }
  if (!fs.existsSync(indexJs)) continue;
  const typesPath = path.join(dist, name, "index.d.ts");
  const fallbackTypes = path.join(dist, name, `${name}.d.ts`);
  componentExports[`./${name}`] = {
    import: `./dist/${name}/index.js`,
    types: fs.existsSync(typesPath) ? `./dist/${name}/index.d.ts` : `./dist/${name}/${name}.d.ts`,
    module: `./dist/${name}/index.js`,
  };
  if (!fs.existsSync(typesPath) && !fs.existsSync(fallbackTypes)) {
    delete componentExports[`./${name}`].types;
  }
}

// Insert component + internals exports after ./vite, before deep wildcards and "./*"
const exp = pkg.exports;
const newExports = {};
for (const [k, v] of Object.entries(exp)) {
  if (
    k === "./*" ||
    k === "./*/*" ||
    k === "./*/*/*" ||
    k === "./*/*/*/*" ||
    k.startsWith("./internals")
  ) {
    continue;
  }
  /* Drop stale ./component keys — rebuilt from dist after ./vite (avoids Pro leftovers). */
  if (!FIXED_EXPORT_KEYS.has(k) && /^\.\/[a-z0-9-]+$/.test(k)) continue;
  newExports[k] = v;
  if (k === "./vite") {
    Object.assign(newExports, componentExports);
    // Deep internals paths used by @velkin/ui-pro (must beat "./*" which appends /index.js).
    newExports["./internals/*"] = {
      import: "./dist/internals/*",
      types: "./dist/internals/*",
      module: "./dist/internals/*",
    };
    newExports["./internals/*/*"] = {
      import: "./dist/internals/*/*",
      types: "./dist/internals/*/*",
      module: "./dist/internals/*/*",
    };
    newExports["./internals/*/*/*"] = {
      import: "./dist/internals/*/*/*",
      types: "./dist/internals/*/*/*",
      module: "./dist/internals/*/*/*",
    };
  }
}
newExports["./*"] = exp["./*"] ?? {
  import: "./dist/*/index.js",
  types: "./dist/*/index.d.ts",
  module: "./dist/*/index.js",
};
newExports["./*/*"] = exp["./*/*"] ?? {
  import: "./dist/*/*",
  types: "./dist/*/*.d.ts",
  module: "./dist/*/*",
};
newExports["./*/*/*"] = exp["./*/*/*"] ?? {
  import: "./dist/*/*/*",
  types: "./dist/*/*/*.d.ts",
  module: "./dist/*/*/*",
};
newExports["./*/*/*/*"] = exp["./*/*/*/*"] ?? {
  import: "./dist/*/*/*/*",
  types: "./dist/*/*/*/*.d.ts",
  module: "./dist/*/*/*/*",
};
pkg.exports = newExports;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

/** Browser globals in decorator metadata break Node/Next SSR module evaluation. */
const SSR_UNSAFE_METADATA_RE =
  /design:type",(?:HTMLElement|HTML[A-Za-z]+Element|ResizeObserver|MutationObserver)\]/g;
let ssrUnsafeHits = 0;
for (const rel of fs.readdirSync(dist, { recursive: true })) {
  const file = typeof rel === "string" ? rel : rel.toString();
  if (!file.endsWith(".js")) continue;
  const abs = path.join(dist, file);
  if (!fs.statSync(abs).isFile()) continue;
  const text = fs.readFileSync(abs, "utf8");
  const matches = text.match(SSR_UNSAFE_METADATA_RE);
  if (matches?.length) {
    ssrUnsafeHits += matches.length;
    console.error(`SSR-unsafe decorator metadata in dist/${file}: ${matches.join(", ")}`);
  }
}
if (ssrUnsafeHits > 0) {
  throw new Error(
    `Found ${ssrUnsafeHits} SSR-unsafe design:type metadata entries in @velkin/ui dist. ` +
      "Set emitDecoratorMetadata:false in packages/core/tsconfig.json and rebuild.",
  );
}

console.log(
  "Generated index.js and package.json exports for",
  Object.keys(componentExports).length,
  "components",
);

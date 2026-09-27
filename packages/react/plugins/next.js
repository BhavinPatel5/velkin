import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const PREPEND_LOADER = path.join(here, "lit-ssr-prepend-loader.cjs");

const TRANSPILE = [
  "@velkin/ui",
  "@velkin/ui-pro",
  "@velkin/react",
  "@velkin/react-pro",
  "@velkin/license",
  "lit",
  "@lit/react",
  "@lit-labs/motion",
  "@lit-labs/ssr",
  "@lit-labs/ssr-react",
  "@lit-labs/ssr-client",
];

function pkgRoot(siteRoot, name) {
  const root = path.join(siteRoot, "node_modules", ...name.split("/"));
  return fs.existsSync(path.join(root, "package.json")) ? root : null;
}

/** Lit's node builds set `isServer === true` — prefer `node` while keeping Next's `"..."`. */
function preferLitNodeConditions(config) {
  config.resolve ??= {};
  const existing = config.resolve.conditionNames ?? ["..."];
  config.resolve.conditionNames = ["node", ...existing.filter((name) => name !== "node")];
}

/** Prefer the app copy of Lit / motion without aliasing package roots (that skips `exports.node`). */
function dedupeLit(config, siteRoot) {
  config.resolve ??= {};
  const appNm = path.join(siteRoot, "node_modules");
  const modules = config.resolve.modules ?? ["node_modules"];
  config.resolve.modules = [
    appNm,
    ...modules.filter((entry) => entry !== appNm && entry !== "node_modules"),
    "node_modules",
  ];
}

function injectLitSsr(config, isServer) {
  const imports = ["@lit-labs/ssr-react/enable-lit-ssr.js"];
  if (isServer) imports.unshift("@velkin/ui/ssr");
  config.module ??= { rules: [] };
  config.module.rules ??= [];
  config.module.rules.unshift({
    test: /[\\/]app[\\/].*\.(?:j|t)sx?$/,
    exclude: [/next[\\/]dist/, /node_modules/],
    loader: PREPEND_LOADER,
    options: { imports },
  });
}

function assignAliases(config, entries) {
  config.resolve ??= {};
  const current = config.resolve.alias;
  if (Array.isArray(current)) {
    const names = new Set(Object.keys(entries));
    config.resolve.alias = [
      ...Object.entries(entries).map(([name, alias]) => ({ name, alias })),
      ...current.filter((entry) => {
        const name = typeof entry === "string" ? entry : entry?.name;
        return !names.has(name);
      }),
    ];
    return;
  }
  config.resolve.alias = { ...(current ?? {}), ...entries };
}

function aliasDeepExports(config, siteRoot, litLocalizeRuntime) {
  const ui = pkgRoot(siteRoot, "@velkin/ui");
  const pro = pkgRoot(siteRoot, "@velkin/ui-pro");
  config.resolve ??= {};
  config.resolve.extensionAlias = {
    ...(config.resolve.extensionAlias ?? {}),
    ".js": [".js", ".ts", ".tsx"],
  };
  const entries = {};
  if (ui) {
    const dist = path.join(ui, "dist");
    entries["@velkin/ui/ssr"] = path.join(ui, "plugins/ssr/register.js");
    entries["@velkin/ui/ssr/hydrate"] = path.join(ui, "plugins/ssr/hydrate.js");
    entries["@velkin/ui/ssr/localize"] = path.join(ui, "plugins/ssr/localize.js");
    entries["@velkin/ui/internals"] = path.join(dist, "internals");
    entries["@velkin/ui/legacy"] = path.join(dist, "legacy");
    entries["@velkin/ui/theme-provider/internals"] = path.join(dist, "theme-provider/internals");
    if (litLocalizeRuntime !== false) {
      const localize =
        typeof litLocalizeRuntime === "string"
          ? litLocalizeRuntime
          : path.join(ui, "plugins/ssr/localize.js");
      entries[path.join(dist, "internals/utils/lit-localize-runtime.js")] = localize;
    }
  }
  if (pro) {
    entries["@velkin/ui-pro/file-picker/internals"] = path.join(
      pro,
      "dist/file-picker/internals",
    );
  }
  assignAliases(config, entries);
}

function applyClientPlugins(config) {
  try {
    const { velkin } = require("@velkin/ui/webpack");
    const { velkinReact } = require("@velkin/react/webpack");
    config.plugins ??= [];
    config.plugins.push(velkin());
    config.plugins.push(velkinReact());
  } catch {
    /* packages not installed yet */
  }
}

/**
 * Next.js webpack helper — deep Lit SSR, CE registry, DSD hydrate path, and auto-import plugins.
 * Consumer: `export default defineVelkin({ ...nextConfig })`.
 *
 * Note: under `next dev`, Lit's development export is expected (see lit.dev/docs/tools/development).
 * `next build` already resolves Lit's production build — no "dev mode" warning in prod.
 * Do not strip webpack `"..."` / rewrite `/development/` paths; that mixes Lit copies and breaks.
 */
export function defineVelkin(nextConfig = {}, options = {}) {
  const siteRoot = options.root ?? process.cwd();
  const transpile = new Set([...(nextConfig.transpilePackages ?? []), ...TRANSPILE]);

  return {
    ...nextConfig,
    transpilePackages: [...transpile],
    webpack(config, ctx) {
      const { isServer, nextRuntime } = ctx;
      if (isServer || nextRuntime === "nodejs") preferLitNodeConditions(config);
      dedupeLit(config, siteRoot);
      injectLitSsr(config, isServer);
      aliasDeepExports(config, siteRoot, options.litLocalizeRuntime);
      if (!isServer && options.autoImport !== false) applyClientPlugins(config);
      const prev = nextConfig.webpack;
      return typeof prev === "function" ? prev(config, ctx) : config;
    },
  };
}

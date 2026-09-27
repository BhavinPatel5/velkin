/**
 * Framework-agnostic icon checker, builder, and sync for projects using Iconify/vu-icon.
 *
 * Usage (from project root):
 *   node path/to/internals/icon-check.js check [options]
 *   node path/to/internals/icon-check.js build [options]
 *   node path/to/internals/icon-check.js apply [options]
 *   node path/to/internals/icon-check.js sync [options]
 *
 * Commands:
 *   check  - Verify local set has all used icons; warn on other prefixes.
 *   build  - Collect icon names from code + map, fetch from Iconify, write local set JSON.
 *   apply  - Apply icon-replacement-map.json replacements in --apply-dir.
 *   sync   - Scan app/components (or --apply-dir) + map for ion icons, update ion-local.json from @iconify-json/ion.
 *
 * Options (env or CLI):
 *   --root=<dir>         Project root (default: process.cwd())
 *   --scan-dirs=<list>   Comma-separated dirs to scan, e.g. "app,src" (default: "app,src")
 *   --local-set=<path>   Path to local icon set JSON (check/sync read; build/sync write)
 *   --prefix=<name>      Preferred prefix for check/sync, e.g. "ion" (default: "ion")
 *   --map=<path>         Path to replacement map JSON for apply/build/sync
 *   --apply-dir=<dir>    For apply/sync: dir to scan (default: app/components)
 *   --iconify-set=<name> For build: Iconify set name (default: "ion")
 *   --out=<path>         For build/sync: output path for local set JSON
 *
 * Config file: optional icon-check.config.json in --root with same keys (camelCase).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_SCAN_DIRS = ["app", "src"];
const SCAN_EXT = new Set([".vue", ".ts", ".js", ".jsx", ".tsx", ".json"]);
const SKIP_DIRS = new Set(["node_modules", ".nuxt", "dist", ".git", "public", "build", ".next"]);
// Matches any quoted "prefix:name" (prefix must start with a letter so "1:3" etc. are ignored).
const QUOTED_ICON_PATTERN = /(["'`])([a-z][a-z0-9-]*:[a-zA-Z0-9_.-]+)\1/g;
const IGNORE_NAMES = new Set([
  "absolute",
  "relative",
  "fixed",
  "sticky",
  "hover",
  "column",
  "row",
  "disabled",
  "none",
]);
const KNOWN_ICON_PREFIXES = new Set([
  "mdi",
  "mdi-light",
  "lucide",
  "ic",
  "material-symbols",
  "material-symbols-light",
  "carbon",
  "iconoir",
  "fa",
  "fa-solid",
  "fa-brands",
  "fa-regular",
  "akar-icons",
  "bx",
  "bi",
  "ri",
  "ph",
  "si",
  "simple-icons",
  "tabler",
  "game-icons",
  "mingcute",
  "eos-icons",
  "ci",
  "teenyicons",
  "pepicons-pop",
  "uiw",
  "line-md",
  "openmoji",
  "cib",
  "my",
  "ion",
]);

function parseArgs() {
  const args = process.argv.slice(2);
  const cmd = args.find((a) => !a.startsWith("--")) || "check";
  const opts = { command: cmd, root: process.cwd() };
  for (const a of args) {
    if (a.startsWith("--root=")) opts.root = path.resolve(opts.root, a.slice(7));
    if (a.startsWith("--scan-dirs="))
      opts.scanDirs = a
        .slice(12)
        .split(",")
        .map((s) => s.trim());
    if (a.startsWith("--local-set=")) opts.localSetPath = a.slice(12);
    if (a.startsWith("--prefix=")) opts.prefix = a.slice(9);
    if (a.startsWith("--map=")) opts.mapPath = a.slice(6);
    if (a.startsWith("--apply-dir=")) opts.applyDir = a.slice(11);
    if (a.startsWith("--iconify-set=")) opts.iconifySet = a.slice(14);
    if (a.startsWith("--out=")) opts.outPath = a.slice(6);
  }
  return opts;
}

function loadConfig(root) {
  const configPath = path.join(root, "icon-check.config.json");
  try {
    const raw = fs.readFileSync(configPath, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function resolveOptions() {
  const opts = parseArgs();
  const root = path.resolve(opts.root);
  const config = loadConfig(root);
  return {
    command: opts.command,
    root,
    scanDirs: opts.scanDirs ?? config.scanDirs ?? DEFAULT_SCAN_DIRS,
    localSetPath:
      opts.localSetPath ??
      config.localSetPath ??
      path.join(root, "app", "components", "vu-icon", "ion-local.json"),
    prefix: opts.prefix ?? config.prefix ?? "ion",
    mapPath:
      opts.mapPath ?? config.mapPath ?? path.join(root, "app", "data", "icon-replacement-map.json"),
    applyDir: opts.applyDir ?? config.applyDir ?? path.join(root, "app", "components"),
    iconifySet: opts.iconifySet ?? config.iconifySet ?? "ion",
    outPath:
      opts.outPath ??
      config.outPath ??
      path.join(root, "app", "components", "vu-icon", "ion-local.json"),
  };
}

function* walkDir(dir, exts = SCAN_EXT, skip = SKIP_DIRS) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (skip.has(e.name)) continue;
      yield* walkDir(full, exts, skip);
    } else if (e.isFile() && exts.has(path.extname(e.name))) {
      yield full;
    }
  }
}

function extractQuotedIcons(text, prefix) {
  const preferred = new Set();
  const other = new Set();
  let m;
  QUOTED_ICON_PATTERN.lastIndex = 0;
  while ((m = QUOTED_ICON_PATTERN.exec(text)) !== null) {
    const full = m[2];
    if (!full || !full.includes(":")) continue;
    const p = full.split(":")[0];
    const name = full.slice(p.length + 1);
    if (IGNORE_NAMES.has(name)) continue;
    if (p === prefix) {
      preferred.add(full);
    } else if (KNOWN_ICON_PREFIXES.has(p)) {
      other.add(full);
    }
  }
  return { preferred, other };
}

// --- command: check ---
function runCheck(options) {
  const { root, scanDirs, localSetPath, prefix } = options;
  let available = new Set();
  try {
    const data = JSON.parse(fs.readFileSync(localSetPath, "utf8"));
    if (data.prefix === prefix && data.icons) {
      available = new Set(Object.keys(data.icons));
    }
  } catch (e) {
    console.error(
      `[icon-check] Could not read local set at ${localSetPath}. Run 'build' first or set --local-set.`,
    );
    process.exit(1);
  }

  const missingByFile = new Map();
  const allMissing = new Set();
  const nonPreferredByFile = new Map();
  const allNonPreferred = new Set();

  for (const dirName of scanDirs) {
    const absDir = path.join(root, dirName);
    for (const filePath of walkDir(absDir)) {
      const text = fs.readFileSync(filePath, "utf8");
      const { preferred, other } = extractQuotedIcons(text, prefix);
      const rel = path.relative(root, filePath);

      for (const fullName of preferred) {
        const name = fullName.replace(new RegExp(`^${prefix}:`), "");
        if (!available.has(name)) {
          allMissing.add(fullName);
          if (!missingByFile.has(rel)) missingByFile.set(rel, new Set());
          missingByFile.get(rel).add(fullName);
        }
      }
      for (const fullName of other) {
        allNonPreferred.add(fullName);
        if (!nonPreferredByFile.has(rel)) nonPreferredByFile.set(rel, new Set());
        nonPreferredByFile.get(rel).add(fullName);
      }
    }
  }

  let exitCode = 0;
  if (allNonPreferred.size > 0) {
    exitCode = 1;
    const sorted = Array.from(allNonPreferred).sort();
    console.warn(
      `\n[icon-check] Non-${prefix} icons in project (replace with ${prefix}: for consistency):`,
    );
    console.warn("  " + sorted.join(", "));
    console.warn("\n  By file:");
    for (const [rel, set] of [...nonPreferredByFile.entries()].sort()) {
      console.warn("    " + rel + ": " + [...set].sort().join(", "));
    }
    console.warn("");
  }
  if (allMissing.size > 0) {
    exitCode = 1;
    const sortedMissing = Array.from(allMissing).sort();
    const namesOnly = sortedMissing.map((s) => s.replace(new RegExp(`^${prefix}:`), ""));
    console.warn(`[icon-check] Missing ${prefix} icons (not in local set):`);
    console.warn("  " + sortedMissing.join(", "));
    console.warn("  Names to add to build: " + namesOnly.join(", "));
    console.warn("\n  By file:");
    for (const [rel, set] of [...missingByFile.entries()].sort()) {
      console.warn("    " + rel + ": " + [...set].sort().join(", "));
    }
    console.warn("\n  Fix: run 'build' or add names to your build config.\n");
  }
  if (exitCode === 0) {
    console.log(
      `[icon-check] All ${prefix} icons are in the local set and no other icon prefixes found.`,
    );
  }
  process.exit(exitCode);
}

// --- command: build ---
function runBuild(options) {
  const { root, outPath, iconifySet, mapPath, scanDirs } = options;
  const iconNames = new Set();

  // 1) From replacement map: after values with prefix
  try {
    const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));
    const p = iconifySet + ":";
    for (const row of map) {
      if (row.after && typeof row.after === "string" && row.after.startsWith(p)) {
        iconNames.add(row.after.slice(p.length));
      }
    }
  } catch {}

  // 2) From codebase: scan for quoted prefix:icon-name
  for (const dirName of scanDirs) {
    const absDir = path.join(root, dirName);
    for (const filePath of walkDir(absDir)) {
      const text = fs.readFileSync(filePath, "utf8");
      const { preferred } = extractQuotedIcons(text, iconifySet);
      for (const full of preferred) {
        iconNames.add(full.replace(new RegExp(`^${iconifySet}:`), ""));
      }
    }
  }

  const iconifyPath = path.join(root, "node_modules", "@iconify-json", iconifySet, "icons.json");
  let fullSet;
  try {
    fullSet = JSON.parse(fs.readFileSync(iconifyPath, "utf8"));
  } catch (e) {
    console.error(
      `[icon-check] Missing @iconify-json/${iconifySet}. Run: npm install @iconify-json/${iconifySet} --save-dev`,
    );
    process.exit(1);
  }

  const toEmit =
    iconNames.size > 0 ? iconNames : new Set(Object.keys(fullSet.icons || {}).slice(0, 50));
  const icons = {};
  const missing = [];
  for (const name of toEmit) {
    if (fullSet.icons && fullSet.icons[name]) {
      icons[name] = fullSet.icons[name];
    } else {
      missing.push(name);
    }
  }

  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const localSet = {
    prefix: iconifySet,
    icons,
    width: fullSet.width ?? 512,
    height: fullSet.height ?? 512,
  };
  fs.writeFileSync(outPath, JSON.stringify(localSet, null, 2), "utf8");
  console.log(`[icon-check] Wrote ${outPath} with ${Object.keys(icons).length} icons.`);
  if (missing.length) {
    console.warn("[icon-check] Missing from Iconify set: " + missing.join(", "));
  }
}

// --- command: apply ---
function runApply(options) {
  const { root, mapPath, applyDir } = options;
  let map;
  try {
    map = JSON.parse(fs.readFileSync(mapPath, "utf8"));
  } catch (e) {
    console.error("[icon-check] Could not read map at " + mapPath);
    process.exit(1);
  }

  const replacements = map
    .filter((row) => row.before && row.before !== row.after)
    .sort((a, b) => (b.before?.length ?? 0) - (a.before?.length ?? 0));

  const dir = path.resolve(root, applyDir);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error("[icon-check] Apply dir not found: " + dir);
    process.exit(1);
  }

  let total = 0;
  const fileCount = {};
  for (const filePath of walkDir(dir)) {
    let content = fs.readFileSync(filePath, "utf8");
    let fileTotal = 0;
    for (const row of replacements) {
      const n = content.split(row.before).length - 1;
      if (n <= 0) continue;
      content = content.split(row.before).join(row.after);
      fileTotal += n;
    }
    if (fileTotal > 0) {
      fs.writeFileSync(filePath, content, "utf8");
      total += fileTotal;
      fileCount[filePath] = fileTotal;
    }
  }
  console.log(
    `[icon-check] Applied ${total} replacements across ${Object.keys(fileCount).length} files.`,
  );
}

// --- command: sync (sync-ion-local: scan applyDir + map, update ion-local from @iconify-json/ion) ---
function runSync(options) {
  const { root, applyDir, outPath, mapPath, prefix } = options;
  const iconNames = new Set();

  // 1) From replacement map: after values with prefix
  try {
    const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));
    const p = prefix + ":";
    for (const row of map) {
      if (row.after && typeof row.after === "string" && row.after.startsWith(p)) {
        iconNames.add(row.after.slice(p.length));
      }
    }
  } catch {}

  // 2) From codebase: scan applyDir for quoted prefix:icon-name
  const syncDir = path.resolve(root, applyDir);
  if (fs.existsSync(syncDir) && fs.statSync(syncDir).isDirectory()) {
    for (const filePath of walkDir(syncDir)) {
      const text = fs.readFileSync(filePath, "utf8");
      const { preferred } = extractQuotedIcons(text, prefix);
      for (const full of preferred) {
        iconNames.add(full.replace(new RegExp(`^${prefix}:`), ""));
      }
    }
  }

  const iconifyPath = path.join(root, "node_modules", "@iconify-json", prefix, "icons.json");
  let fullSet;
  try {
    fullSet = JSON.parse(fs.readFileSync(iconifyPath, "utf8"));
  } catch (e) {
    console.error(
      `[icon-check] Missing @iconify-json/${prefix}. Run: npm install @iconify-json/${prefix} --save-dev`,
    );
    process.exit(1);
  }

  const icons = {};
  const missing = [];
  for (const name of [...iconNames].sort()) {
    if (fullSet.icons && fullSet.icons[name]) {
      icons[name] = fullSet.icons[name];
    } else {
      missing.push(name);
    }
  }

  const localSet = {
    prefix,
    icons,
    width: fullSet.width ?? 512,
    height: fullSet.height ?? 512,
  };
  const out = path.resolve(root, outPath);
  const dir = path.dirname(out);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(out, JSON.stringify(localSet, null, 2), "utf8");
  console.log(
    `[icon-check] Synced ${out} with ${Object.keys(icons).length} icons (from ${applyDir} + map).`,
  );
  if (missing.length) {
    console.warn("[icon-check] Not in @iconify-json/" + prefix + ": " + missing.join(", "));
  }
}

// --- main ---
function main() {
  const options = resolveOptions();
  const cmd = (options.command || "check").toLowerCase();
  if (cmd === "check") runCheck(options);
  else if (cmd === "build") runBuild(options);
  else if (cmd === "apply") runApply(options);
  else if (cmd === "sync") runSync(options);
  else {
    console.error("[icon-check] Unknown command: " + cmd + ". Use: check | build | apply | sync");
    process.exit(1);
  }
}

main();

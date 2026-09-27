#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const templatesRoot = join(here, "templates");

function printHelp() {
  console.log(`Usage: create-velkin-app <dir> [--template next|vite|vue] [--pm npm|pnpm|yarn] [--force]

Scaffolds a Velkin UI app with VuThemeProvider, bundler plugins, example UI,
AGENTS.md, Cursor skill, and MCP config.
`);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    printHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }
  let dir = null;
  let template = "next";
  let pm = "npm";
  let force = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--force") {
      force = true;
      continue;
    }
    if (arg === "--template") {
      template = args[++i] ?? template;
      continue;
    }
    if (arg?.startsWith("--template=")) {
      template = arg.slice("--template=".length);
      continue;
    }
    if (arg === "--pm") {
      pm = args[++i] ?? pm;
      continue;
    }
    if (arg?.startsWith("--pm=")) {
      pm = arg.slice("--pm=".length);
      continue;
    }
    if (arg?.startsWith("-")) {
      throw new Error(`Unknown flag: ${arg}`);
    }
    if (!dir) dir = arg;
  }
  if (!dir) throw new Error("Provide a target directory.");
  if (template === "vite-react") template = "vite";
  if (template === "vite-vue") template = "vue";
  if (template !== "next" && template !== "vite" && template !== "vue") {
    throw new Error(`Unknown template "${template}". Use next, vite, or vue.`);
  }
  if (!["npm", "pnpm", "yarn"].includes(pm)) {
    throw new Error(`Unknown package manager "${pm}". Use npm, pnpm, or yarn.`);
  }
  return { dir: resolve(dir), template, pm, force };
}

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    if (entry === ".gitkeep") continue;
    const from = join(src, entry);
    const to = join(dest, entry);
    if (statSync(from).isDirectory()) copyDir(from, to);
    else {
      mkdirSync(dirname(to), { recursive: true });
      cpSync(from, to);
    }
  }
}

function copySharedAgentFiles(dest) {
  const shared = join(templatesRoot, "shared");
  if (!existsSync(shared)) return;
  const agents = join(shared, "AGENTS.md");
  const skill = join(shared, "SKILL.md");
  const mcp = join(shared, "mcp.cursor.json");
  if (existsSync(agents)) cpSync(agents, join(dest, "AGENTS.md"));
  if (existsSync(skill)) {
    mkdirSync(join(dest, ".cursor/skills/velkin"), { recursive: true });
    cpSync(skill, join(dest, ".cursor/skills/velkin/SKILL.md"));
  }
  if (existsSync(mcp)) {
    mkdirSync(join(dest, ".cursor"), { recursive: true });
    cpSync(mcp, join(dest, ".cursor/mcp.json"));
  }
}

try {
  const { dir, template, pm, force } = parseArgs(process.argv);
  if (existsSync(dir) && readdirSync(dir).length > 0 && !force) {
    throw new Error(`${dir} is not empty. Pass --force to overwrite into it.`);
  }
  mkdirSync(dir, { recursive: true });
  const tmplDir =
    template === "vite" ? "vite-react" : template === "vue" ? "vite-vue" : "next";
  const tmpl = join(templatesRoot, tmplDir);
  if (!existsSync(tmpl)) throw new Error(`Missing template: ${tmpl}`);
  copyDir(tmpl, dir);
  copySharedAgentFiles(dir);

  const pkgPath = join(dir, "package.json");
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    pkg.name = dir.split(/[/\\]/).filter(Boolean).at(-1) || pkg.name;
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }

  const install =
    pm === "pnpm" ? "pnpm install" : pm === "yarn" ? "yarn" : "npm install";
  const dev = pm === "pnpm" ? "pnpm dev" : pm === "yarn" ? "yarn dev" : "npm run dev";
  console.log(`Created Velkin ${template} app at ${dir}

Next:
  cd ${dir}
  ${install}
  ${dev}

MCP is pre-wired (.cursor/mcp.json + AGENTS.md + skill).
`);
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}

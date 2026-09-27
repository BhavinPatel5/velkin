import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
/** Dist → package root (contains templates/). */
const PACKAGE_ROOT = join(HERE, "..");
const TEMPLATES = join(PACKAGE_ROOT, "templates");

export type McpInitClient = "cursor" | "claude" | "vscode" | "all";

const CLIENTS: McpInitClient[] = ["cursor", "claude", "vscode", "all"];

export function parseInitArgs(args: string[]): {
  client: McpInitClient;
  cwd: string;
  force: boolean;
} | null {
  if (!args.includes("init")) return null;
  let client: McpInitClient = "cursor";
  let force = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--force") force = true;
    if (a === "--client" && args[i + 1]) {
      const next = args[++i] as McpInitClient;
      if (!CLIENTS.includes(next)) {
        throw new Error(`Unknown --client ${next}. Use: cursor | claude | vscode | all`);
      }
      client = next;
    }
  }
  return { client, cwd: process.cwd(), force };
}

function ensureTemplate(name: string): string {
  const path = join(TEMPLATES, name);
  if (!existsSync(path)) {
    throw new Error(`Missing template ${name} in @velkin/mcp (expected ${path})`);
  }
  return path;
}

function writeFileSafe(dest: string, contents: string, force: boolean): "wrote" | "skipped" {
  if (existsSync(dest) && !force) return "skipped";
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, contents, "utf8");
  return "wrote";
}

function copySafe(src: string, dest: string, force: boolean): "wrote" | "skipped" {
  if (existsSync(dest) && !force) return "skipped";
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest);
  return "wrote";
}

/** Scaffold MCP config + AGENTS.md (+ Cursor skill) into an existing app. */
export function runVelkinMcpInit(opts: {
  client: McpInitClient;
  cwd: string;
  force: boolean;
}): string[] {
  const log: string[] = [];
  const agentsSrc = ensureTemplate("AGENTS.md");
  const agentsDest = join(opts.cwd, "AGENTS.md");
  log.push(`AGENTS.md: ${copySafe(agentsSrc, agentsDest, opts.force)}`);

  const targets: McpInitClient[] =
    opts.client === "all" ? ["cursor", "claude", "vscode"] : [opts.client];

  for (const client of targets) {
    if (client === "cursor") {
      const mcpSrc = ensureTemplate("mcp.cursor.json");
      const mcpDest = join(opts.cwd, ".cursor", "mcp.json");
      log.push(`.cursor/mcp.json: ${copySafe(mcpSrc, mcpDest, opts.force)}`);

      const skillSrc = ensureTemplate("SKILL.md");
      const skillDest = join(opts.cwd, ".cursor", "skills", "velkin", "SKILL.md");
      log.push(`.cursor/skills/velkin/SKILL.md: ${copySafe(skillSrc, skillDest, opts.force)}`);
    }

    if (client === "claude") {
      const mcpSrc = ensureTemplate("mcp.claude.json");
      // Claude Desktop / Claude Code often use project .mcp.json or merge into user config.
      const mcpDest = join(opts.cwd, ".mcp.json");
      log.push(`.mcp.json (Claude): ${copySafe(mcpSrc, mcpDest, opts.force)}`);
    }

    if (client === "vscode") {
      const mcpSrc = ensureTemplate("mcp.vscode.json");
      const mcpDest = join(opts.cwd, ".vscode", "mcp.json");
      log.push(`.vscode/mcp.json: ${copySafe(mcpSrc, mcpDest, opts.force)}`);
    }
  }

  // Echo remote URL reminder from cursor template.
  try {
    const sample = JSON.parse(readFileSync(ensureTemplate("mcp.cursor.json"), "utf8")) as {
      mcpServers?: { velkin?: { url?: string } };
    };
    const url = sample.mcpServers?.velkin?.url;
    if (url) log.push(`Remote MCP URL: ${url}`);
  } catch {
    /* ignore */
  }

  return log;
}

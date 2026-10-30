import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
/** Dist → package root (contains templates/). */
const PACKAGE_ROOT = join(HERE, "..");
const TEMPLATES = join(PACKAGE_ROOT, "templates");

export type McpInitClient =
  | "cursor"
  | "vscode"
  | "claude"
  | "windsurf"
  | "cline"
  | "antigravity"
  | "gemini"
  | "codex"
  | "zed"
  | "all";

export type McpInitTransport = "remote" | "stdio" | "both";

const CLIENTS: McpInitClient[] = [
  "cursor",
  "vscode",
  "claude",
  "windsurf",
  "cline",
  "antigravity",
  "gemini",
  "codex",
  "zed",
  "all",
];

export function parseInitArgs(args: string[]): {
  client: McpInitClient;
  transport: McpInitTransport;
  cwd: string;
  force: boolean;
} | null {
  if (!args.includes("init")) return null;
  let client: McpInitClient = "cursor";
  let transport: McpInitTransport = "both";
  let force = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--force") force = true;
    if (a === "--stdio") transport = "stdio";
    if (a === "--remote") transport = "remote";
    if (a === "--transport" && args[i + 1]) {
      const nextT = args[++i] as McpInitTransport;
      if (!["remote", "stdio", "both"].includes(nextT)) {
        throw new Error(`Unknown --transport ${nextT}. Use: remote | stdio | both`);
      }
      transport = nextT;
    }
    if (a === "--client" && args[i + 1]) {
      const next = args[++i] as McpInitClient;
      if (!CLIENTS.includes(next)) {
        throw new Error(
          `Unknown --client ${next}. Use: cursor | vscode | claude | windsurf | cline | antigravity | gemini | codex | zed | all`
        );
      }
      client = next;
    }
  }
  return { client, transport, cwd: process.cwd(), force };
}

function ensureTemplate(name: string): string {
  const path = join(TEMPLATES, name);
  if (!existsSync(path)) {
    throw new Error(`Missing template ${name} in @velkin/mcp (expected ${path})`);
  }
  return path;
}

function copySafe(src: string, dest: string, force: boolean): "wrote" | "skipped" {
  if (existsSync(dest) && !force) return "skipped";
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest);
  return "wrote";
}

/** Scaffold MCP config + AGENTS.md (+ agent skills) into an existing app. */
export function runVelkinMcpInit(opts: {
  client: McpInitClient;
  transport?: McpInitTransport;
  cwd: string;
  force: boolean;
}): string[] {
  const log: string[] = [];
  const agentsSrc = ensureTemplate("AGENTS.md");
  const agentsDest = join(opts.cwd, "AGENTS.md");
  log.push(`AGENTS.md: ${copySafe(agentsSrc, agentsDest, opts.force)}`);

  const allClients: McpInitClient[] = [
    "cursor",
    "vscode",
    "claude",
    "windsurf",
    "cline",
    "antigravity",
    "gemini",
    "codex",
    "zed",
  ];

  const targets: McpInitClient[] =
    opts.client === "all" ? allClients : [opts.client];

  const skillSrc = ensureTemplate("SKILL.md");
  const transport = opts.transport ?? "both";

  function getClientTemplate(client: McpInitClient): string {
    if (client === "zed") return "mcp.zed.json";
    if (transport === "stdio") return `mcp.${client}.stdio.json`;
    return `mcp.${client}.json`;
  }

  for (const client of targets) {
    const tmpl = getClientTemplate(client);

    if (client === "cursor") {
      const mcpSrc = ensureTemplate(tmpl);
      const mcpDest = join(opts.cwd, ".cursor", "mcp.json");
      log.push(`.cursor/mcp.json: ${copySafe(mcpSrc, mcpDest, opts.force)}`);

      const skillDest = join(opts.cwd, ".cursor", "skills", "velkin", "SKILL.md");
      log.push(`.cursor/skills/velkin/SKILL.md: ${copySafe(skillSrc, skillDest, opts.force)}`);
    }

    if (client === "vscode") {
      const mcpSrc = ensureTemplate(tmpl);
      const mcpDest = join(opts.cwd, ".vscode", "mcp.json");
      log.push(`.vscode/mcp.json: ${copySafe(mcpSrc, mcpDest, opts.force)}`);
    }

    if (client === "claude") {
      const mcpSrc = ensureTemplate(tmpl);
      const mcpDest = join(opts.cwd, ".mcp.json");
      log.push(`.mcp.json (Claude): ${copySafe(mcpSrc, mcpDest, opts.force)}`);
    }

    if (client === "windsurf") {
      const mcpSrc = ensureTemplate(tmpl);
      const mcpDest = join(opts.cwd, ".windsurf", "mcp.json");
      log.push(`.windsurf/mcp.json: ${copySafe(mcpSrc, mcpDest, opts.force)}`);
    }

    if (client === "cline") {
      const mcpSrc = ensureTemplate(tmpl);
      const mcpDest = join(opts.cwd, ".cline", "mcp.json");
      log.push(`.cline/mcp.json: ${copySafe(mcpSrc, mcpDest, opts.force)}`);
    }

    if (client === "antigravity") {
      const mcpSrc = ensureTemplate(tmpl);
      const mcpDest = join(opts.cwd, ".agents", "mcp_config.json");
      log.push(`.agents/mcp_config.json: ${copySafe(mcpSrc, mcpDest, opts.force)}`);

      const skillDest = join(opts.cwd, ".agents", "skills", "velkin", "SKILL.md");
      log.push(`.agents/skills/velkin/SKILL.md: ${copySafe(skillSrc, skillDest, opts.force)}`);
    }

    if (client === "gemini") {
      const mcpSrc = ensureTemplate(tmpl);
      const mcpDest = join(opts.cwd, "gemini.config.json");
      log.push(`gemini.config.json: ${copySafe(mcpSrc, mcpDest, opts.force)}`);
    }

    if (client === "codex") {
      const mcpSrc = ensureTemplate(tmpl);
      const mcpDest = join(opts.cwd, ".codex", "mcp.json");
      log.push(`.codex/mcp.json: ${copySafe(mcpSrc, mcpDest, opts.force)}`);
    }

    if (client === "zed") {
      const mcpSrc = ensureTemplate(tmpl);
      const mcpDest = join(opts.cwd, ".zed", "settings.json");
      log.push(`.zed/settings.json: ${copySafe(mcpSrc, mcpDest, opts.force)}`);
    }
  }

  // Echo endpoint and stdio command info
  log.push(`Remote MCP URL: https://mcp.velkinui.com/mcp`);
  log.push(`Local stdio command: npx -y @velkin/mcp`);

  return log;
}

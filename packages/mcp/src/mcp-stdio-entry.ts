#!/usr/bin/env node
import { assertCoreDependencyAvailable, startVelkinMcpStdio } from "./server.js";
import { getMcpRuntimeStatus } from "./mcp-runtime-status.js";
import { parseInitArgs, runVelkinMcpInit } from "./mcp-init.js";

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`velkin-mcp — Velkin MCP server (@velkin/mcp)

Usage:
  npx velkin-mcp                         Start stdio MCP server
  npx velkin-mcp --health                Print runtime / docs health JSON
  npx velkin-mcp init [--client cursor|claude|vscode|all] [--force]
                                         Write MCP config + AGENTS.md (+ Cursor skill)

Remote (no install): https://mcp.velkinui.com/mcp
`);
  process.exit(0);
}

if (args.includes("--health")) {
  try {
    assertCoreDependencyAvailable();
    const status = getMcpRuntimeStatus();
    console.log(JSON.stringify({ ...status, ok: status.core.docsReady }, null, 2));
    process.exit(status.core.docsReady ? 0 : 1);
  } catch (err: unknown) {
    console.error("[velkin-mcp] health: failed");
    console.error(err);
    process.exit(1);
  }
}

try {
  const init = parseInitArgs(args);
  if (init) {
    const log = runVelkinMcpInit(init);
    console.log(`[velkin-mcp] init --client ${init.client}`);
    for (const line of log) console.log(`  ${line}`);
    console.log(`
Next: reload MCP in your IDE, then call get_velkin_component_docs before generating UI.
Docs: https://velkinui.com/docs/mcp-servers
`);
    process.exit(0);
  }
} catch (err: unknown) {
  console.error("[velkin-mcp] init failed");
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}

startVelkinMcpStdio().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

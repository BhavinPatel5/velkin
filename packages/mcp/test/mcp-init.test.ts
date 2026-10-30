import { strict as assert } from "node:assert";
import { mkdtempSync, readFileSync, existsSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { parseInitArgs, runVelkinMcpInit, type McpInitClient, type McpInitTransport } from "../src/mcp-init.js";

const paths = {
  cursor: ".cursor/mcp.json", vscode: ".vscode/mcp.json", claude: ".mcp.json",
  windsurf: ".windsurf/mcp.json", cline: ".cline/mcp.json", antigravity: ".agents/mcp_config.json",
  gemini: ".gemini/settings.json", codex: ".codex/config.toml", zed: ".zed/settings.json",
};

for (const transport of ["remote", "stdio", "both"] as McpInitTransport[]) {
  test(`generates all clients with only the requested ${transport} transports`, () => {
    const cwd = mkdtempSync(join(tmpdir(), "velkin-init-"));
    try {
      const log = runVelkinMcpInit({ client: "all", transport, cwd, force: false });
      assert(existsSync(join(cwd, "AGENTS.md")));
      for (const [client, path] of Object.entries(paths)) {
        const content = readFileSync(join(cwd, path), "utf8");
        if (client === "codex") {
          assert(content.includes("[mcp_servers."));
          assert.equal(content.includes("url ="), transport !== "stdio");
          assert.equal(content.includes("command ="), transport !== "remote");
          continue;
        }
        const config = JSON.parse(content);
        const servers = config.servers ?? config.mcpServers ?? config.context_servers;
        const entries = Object.values(servers) as Record<string, unknown>[];
        assert.equal(entries.length, transport === "both" ? 2 : 1, client);
        assert.equal(entries.some((entry) => entry.command), transport !== "remote", client);
        assert.equal(entries.some((entry) => entry.url || entry.httpUrl || entry.serverUrl), transport !== "stdio", client);
        if (client === "gemini" && transport !== "stdio") assert(servers.velkin.httpUrl);
        if ((client === "vscode" || client === "claude") && transport !== "stdio") assert.equal(servers.velkin.type, "http");
      }
      assert(log.some((line) => line.includes("Cline Configure MCP Servers")));
      assert(log.some((line) => line.includes("Windsurf MCP settings")));
    } finally { rmSync(cwd, { recursive: true, force: true }); }
  });
}

test("preserves existing config files unless force is explicit", () => {
  const cwd = mkdtempSync(join(tmpdir(), "velkin-init-"));
  try {
    runVelkinMcpInit({ client: "codex", transport: "remote", cwd, force: false });
    const path = join(cwd, paths.codex);
    writeFileSync(path, "existing config");
    runVelkinMcpInit({ client: "codex", transport: "stdio", cwd, force: false });
    assert.equal(readFileSync(path, "utf8"), "existing config");
    runVelkinMcpInit({ client: "codex", transport: "stdio", cwd, force: true });
    assert(readFileSync(path, "utf8").includes("command ="));
  } finally { rmSync(cwd, { recursive: true, force: true }); }
});

test("parses transport flags and rejects missing or invalid arguments", () => {
  assert.equal(parseInitArgs(["init", "--remote"])?.transport, "remote");
  assert.equal(parseInitArgs(["init", "--stdio"])?.transport, "stdio");
  assert.equal(parseInitArgs(["init", "--transport", "both"])?.transport, "both");
  for (const args of [["--transport"], ["--client"], ["--client", "--force"], ["--transport", "invalid"], ["--client", "invalid"]]) {
    assert.throws(() => parseInitArgs(["init", ...args]));
  }
  assert.equal(parseInitArgs(["--health"]), null);
});

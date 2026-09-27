#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const serverSrc = fs.readFileSync(path.join(here, "../src/server.ts"), "utf8");
const allowlistSrc = fs.readFileSync(path.join(here, "../src/read-only-tool-allowlist.ts"), "utf8");

const registered = [...serverSrc.matchAll(/registerTool\(\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);

const allowMatch = allowlistSrc.match(/READ_ONLY_TOOL_NAMES\s*=\s*\[([\s\S]*?)\]\s*as const/);
const allowlisted = allowMatch
  ? [...allowMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1])
  : [];

const regSet = new Set(registered);
const allowSet = new Set(allowlisted);

const missingInAllowlist = registered.filter((n) => !allowSet.has(n));
const extraInAllowlist = allowlisted.filter((n) => !regSet.has(n));

if (missingInAllowlist.length || extraInAllowlist.length) {
  console.error("MCP tool parity mismatch:");
  if (missingInAllowlist.length) console.error("  missing in allowlist:", missingInAllowlist);
  if (extraInAllowlist.length) console.error("  extra in allowlist:", extraInAllowlist);
  process.exit(1);
}

const catalogMatch = serverSrc.match(/READ_ONLY_TOOL_NAMES\.map/);
if (!catalogMatch) {
  console.error("Expected tools catalog resource to use READ_ONLY_TOOL_NAMES");
  process.exit(1);
}

console.log(`✅ MCP tool parity OK (${registered.length} tools)`);

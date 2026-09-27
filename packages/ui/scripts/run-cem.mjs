/**
 * Runs the Custom Elements Manifest analyzer without relying on a global `cem` binary.
 * Resolves @custom-elements-manifest/analyzer from this package's dependencies.
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const mainRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(mainRoot, "package.json"));
let analyzerDir;
try {
  analyzerDir = path.dirname(require.resolve("@custom-elements-manifest/analyzer/package.json"));
} catch {
  console.error(
    "[@velkin/ui] Missing @custom-elements-manifest/analyzer. From the monorepo root run: npm install",
  );
  process.exit(1);
}
const cli = path.join(analyzerDir, "cem.js");
const result = spawnSync(
  process.execPath,
  [cli, "analyze", "--config", "custom-elements-manifest.config.js"],
  {
    cwd: mainRoot,
    stdio: "inherit",
  },
);
process.exit(result.status === null ? 1 : result.status);

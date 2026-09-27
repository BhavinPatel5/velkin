import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveCorePackageRoot } from "./catalog.js";
import { withVelkinMcpMeta } from "./mcp-response-meta.js";
import { McpErrorCode, mcpToolErr } from "./mcp-tool-errors.js";

export type ChangelogRequest = {
  fromVersion?: string | null;
  toVersion?: string | null;
  component?: string | null;
};

export type ChangelogEntry = {
  version: string;
  date?: string;
  breaking: string[];
  features: string[];
  fixes: string[];
  other: string[];
};

/** Simple semver comparison: returns -1, 0, 1 */
function semverCompare(a: string, b: string): number {
  const parse = (v: string) => v.replace(/^v/, "").split(".").map(Number);
  const [aMaj, aMin, aPat] = parse(a);
  const [bMaj, bMin, bPat] = parse(b);
  if (aMaj !== bMaj) return (aMaj ?? 0) > (bMaj ?? 0) ? 1 : -1;
  if (aMin !== bMin) return (aMin ?? 0) > (bMin ?? 0) ? 1 : -1;
  if (aPat !== bPat) return (aPat ?? 0) > (bPat ?? 0) ? 1 : -1;
  return 0;
}

function parseChangelog(content: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  // Split on version headers: ## [x.y.z] or ## x.y.z
  const sections = content.split(/\n(?=##\s)/);

  for (const section of sections) {
    const headerMatch = section.match(
      /^##\s+\[?v?([\d]+\.[\d]+\.[\d]+)\]?(?:\s+-\s+([\d]{4}-[\d]{2}-[\d]{2}))?/,
    );
    if (!headerMatch) continue;

    const version = headerMatch[1]!;
    const date = headerMatch[2];
    const entry: ChangelogEntry = {
      version,
      date,
      breaking: [],
      features: [],
      fixes: [],
      other: [],
    };

    let currentSection: "breaking" | "features" | "fixes" | "other" = "other";

    for (const line of section.split("\n")) {
      const trimmed = line.trim();

      // Detect subsection
      if (/^###?\s+(breaking|breaking changes)/i.test(trimmed)) {
        currentSection = "breaking";
        continue;
      }
      if (/^###?\s+(feat|features?|added|new)/i.test(trimmed)) {
        currentSection = "features";
        continue;
      }
      if (/^###?\s+(fix|fixes?|bug|bugfix|patch)/i.test(trimmed)) {
        currentSection = "fixes";
        continue;
      }
      if (/^###?/.test(trimmed)) {
        currentSection = "other";
        continue;
      }

      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const item = trimmed.replace(/^[-*]\s+/, "");
        if (item.length > 3) entry[currentSection].push(item);
      }
    }

    entries.push(entry);
  }

  return entries;
}

export function handleGetChangelog(req: ChangelogRequest) {
  try {
    const coreRoot = resolveCorePackageRoot();
    if (!coreRoot) {
      return mcpToolErr(
        McpErrorCode.CHANGELOG_FAILED,
        "@velkin/ui package root not found. Build the package first.",
      );
    }

    // Look for CHANGELOG.md in common locations
    const candidatePaths = [
      join(coreRoot, "CHANGELOG.md"),
      join(coreRoot, "..", "CHANGELOG.md"),
      join(coreRoot, "..", "..", "CHANGELOG.md"),
    ];

    let changelogContent: string | null = null;
    let changelogPath: string | null = null;
    for (const p of candidatePaths) {
      if (existsSync(p)) {
        changelogContent = readFileSync(p, "utf8");
        changelogPath = p;
        break;
      }
    }

    if (!changelogContent) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              withVelkinMcpMeta(
                {
                  found: false,
                  message:
                    "No CHANGELOG.md found in @velkin/ui package. The package may not ship a changelog.",
                  searchedPaths: candidatePaths,
                },
                { truthLayer: "authoritative" },
              ),
              null,
              2,
            ),
          },
        ],
      };
    }

    let entries = parseChangelog(changelogContent);

    // Filter by version range
    if (req.fromVersion) {
      entries = entries.filter((e) => semverCompare(e.version, req.fromVersion!) >= 0);
    }
    if (req.toVersion) {
      entries = entries.filter((e) => semverCompare(e.version, req.toVersion!) <= 0);
    }

    // Filter by component name
    if (req.component) {
      const compFilter = req.component.toLowerCase().replace(/^vu-/, "");
      entries = entries
        .map((entry) => ({
          ...entry,
          breaking: entry.breaking.filter((l) => l.toLowerCase().includes(compFilter)),
          features: entry.features.filter((l) => l.toLowerCase().includes(compFilter)),
          fixes: entry.fixes.filter((l) => l.toLowerCase().includes(compFilter)),
          other: entry.other.filter((l) => l.toLowerCase().includes(compFilter)),
        }))
        .filter((e) => e.breaking.length + e.features.length + e.fixes.length + e.other.length > 0);
    }

    const totalBreaking = entries.reduce((n, e) => n + e.breaking.length, 0);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            withVelkinMcpMeta(
              {
                source: changelogPath,
                versionRange: {
                  from: req.fromVersion ?? "earliest",
                  to: req.toVersion ?? "latest",
                },
                component: req.component ?? "all",
                entryCount: entries.length,
                totalBreakingChanges: totalBreaking,
                entries: entries.slice(0, 20), // cap at 20 versions
              },
              {
                truthLayer: "authoritative",
                agentMust:
                  "Review breaking changes before upgrading. Check each breaking item against your current usage.",
              },
            ),
            null,
            2,
          ),
        },
      ],
    };
  } catch (err) {
    return mcpToolErr(
      McpErrorCode.CHANGELOG_FAILED,
      err instanceof Error ? err.message : String(err),
    );
  }
}

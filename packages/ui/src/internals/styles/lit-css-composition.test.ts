import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/** Lit drops a following `:host` when these selector-less fragments sit at stylesheet root. */
const BARE_LIT_CSS_FRAGMENTS = [
  "segmentTrackRadiusTokens",
  "menuPanelRadiusTokens",
  "menuOverlayCohesionHost",
  "menuPanelInnerClip",
  "menuPanelItemCorners",
  "softCorners",
  "roundCorners",
  "glassSoftCorners",
] as const;

const ROOT = join(import.meta.dirname, "../../..");
const STYLE_ROOTS = [join(ROOT, "src"), join(ROOT, "packages")];

function collectStyleFiles(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      collectStyleFiles(path, acc);
    } else if (name.endsWith(".style.ts")) {
      acc.push(path);
    }
  }
  return acc;
}

/** Root-level `  ${fragment}` immediately before `  :host` inside a `css` template. */
export function findBareFragmentBeforeHost(source: string): string[] {
  const hits = new Set<string>();
  for (const fragment of BARE_LIT_CSS_FRAGMENTS) {
    const pattern = new RegExp(
      String.raw`(?:^|\n)  \$\{${fragment}\}\s*(?:/\*[\s\S]*?\*/\s*)*(?:\n\s*)*:host\s*[\[{]`,
      "m",
    );
    if (pattern.test(source)) hits.add(fragment);
  }
  return [...hits];
}

describe("lit css composition", () => {
  it("detects bare selector-less fragments placed before :host", () => {
    const bad = [
      "export const badStyles = css`",
      "  ${segmentTrackRadiusTokens}",
      "",
      "  :host {",
      "    display: block;",
      "  }",
      "`;",
    ].join("\n");
    expect(findBareFragmentBeforeHost(bad)).toEqual(["segmentTrackRadiusTokens"]);
  });

  it("allows bare fragments nested inside :host", () => {
    const good = [
      "export const goodStyles = css`",
      "  :host {",
      "    --menu-panel-radius: var(--menu-overlay-radius);",
      "    ${menuPanelRadiusTokens}",
      "  }",
      "`;",
    ].join("\n");
    expect(findBareFragmentBeforeHost(good)).toEqual([]);
  });

  it("allows shared fragments that declare their own :host before component :host", () => {
    const good = [
      "export const goodStyles = css`",
      "  ${controlSizeMetricsTokens}",
      "",
      "  :host {",
      "    display: inline-flex;",
      "  }",
      "`;",
    ].join("\n");
    expect(findBareFragmentBeforeHost(good)).toEqual([]);
  });

  it("style files do not place bare fragments before :host", () => {
    const styleFiles = STYLE_ROOTS.flatMap((dir) => collectStyleFiles(dir));
    const violations: string[] = [];

    for (const file of styleFiles) {
      const source = readFileSync(file, "utf8");
      const fragments = findBareFragmentBeforeHost(source);
      if (fragments.length) {
        violations.push(
          `${relative(ROOT, file)}: ${fragments.join(", ")} before :host`,
        );
      }
    }

    expect(violations, violations.join("\n")).toEqual([]);
  });
});

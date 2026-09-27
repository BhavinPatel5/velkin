import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { expect, it, describe } from "vitest";

const SRC_ROOT = join(process.cwd(), "src");

/** Legacy bare semantic names removed from theme-provider emission. */
const LEGACY_SEMANTIC =
  /var\(--vu-(background|foreground|accent|muted|surface|border|separator|default|success|warning|danger|overlay|segment|focus|link|backdrop)\)/;

/** Invalid spacing steps (see 30-tokens-and-helpers.mdc). */
const INVALID_SPACE = /--vu-space-(0-5|1[3-9]|2-75)/;

/** Phantom tokens that are not defined in theme-core (use canonical names). */
const PHANTOM_COLOR =
  /--vu-color-(primary|secondary|info|foreground-muted)(?:-soft(?:-foreground)?)?/;

/** Surface tone is a prop/helper concept, not a public global token family. */
const PHANTOM_SURFACE_TONE = /--vu-surface-tone-/;

/** border-light is a border shorthand — not a stroke/fill color (accordion may use it as `border-*`). */
const BORDER_LIGHT_AS_COLOR =
  /(?:solid|dashed|stroke|background|border-color)[^;{]*var\(--vu-border-light/;

function walk(dir: string, out: string[] = []): string[] {
  for (const ent of readdirSync(dir)) {
    const p = join(dir, ent);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (ent === "node_modules" || ent === "dist" || ent === "test") continue;
      walk(p, out);
    } else if (/\.(ts|css)$/.test(ent)) {
      out.push(p);
    }
  }
  return out;
}

describe("theme token usage", () => {
  it("src/components avoids legacy bare semantic --vu-* color tokens", () => {
    const violations: string[] = [];
    for (const file of walk(join(SRC_ROOT, "components"))) {
      if (file.includes("theme-provider/internals/theme-core.ts")) continue;
      const text = readFileSync(file, "utf8");
      if (LEGACY_SEMANTIC.test(text)) violations.push(file);
      if (INVALID_SPACE.test(text)) violations.push(`${file} (invalid space)`);
      if (PHANTOM_COLOR.test(text)) violations.push(`${file} (phantom color token)`);
      if (PHANTOM_SURFACE_TONE.test(text)) violations.push(`${file} (phantom surface-tone token)`);
      if (BORDER_LIGHT_AS_COLOR.test(text)) violations.push(`${file} (border-light as color)`);
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });

  it("internals color-resolver maps intents to canonical tokens", () => {
    const text = readFileSync(join(SRC_ROOT, "internals/utils/color-resolver.ts"), "utf8");
    expect(text).toMatch(/muted:\s*'var\(--vu-color-muted\)'/);
    expect(text).toMatch(/'border-light':\s*'var\(--vu-color-separator\)'/);
    expect(text).not.toMatch(/var\(--vu-muted\)/);
  });
});

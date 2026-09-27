import { withVelkinMcpMeta } from "./mcp-response-meta.js";
import { McpErrorCode, mcpToolErr } from "./mcp-tool-errors.js";

export type ThemeRequest = {
  operation: "guide" | "preference" | "compose";
  preference?: "light" | "dark" | "system" | null;
};

const THEME_GUIDE = `# Velkin theme provider

Wrap your app with \`VuThemeProvider\` (\`@velkin/react/theme-provider\` or \`<vu-theme-provider>\`).

## Key props
- \`preference\` — \`light\` | \`dark\` | \`system\`
- \`persist\` — save preference to localStorage (key: \`theme\`)
- \`scope\` — \`root\` | \`host\` | \`both\` (where CSS variables apply)
- \`locale\` — BCP 47 locale for built-in localized strings

## Next.js / SSR
Add a blocking script in \`<head>\` to set \`data-theme\` on \`<html>\` before hydration, and use \`suppressHydrationWarning\` on \`<html>\`.

## Custom tokens
Pass \`theme\` (\`VuThemeConfig\`): \`primary\`, \`success\`, \`warning\`, \`danger\`, \`neutral\`, \`tint\`, \`radius\`, \`spacing\`, \`fontSans\`, \`fontMono\`.
Surfaces, borders, and every foreground derive automatically; per-mode seeds go in \`light\` / \`dark\`, and raw \`--vu-*\` overrides in \`vars\`.

Use \`VuThemeSwitcher\` for a built-in preference control.

When authoring a custom palette (OKLCH accents, WCAG AA, hue separation from danger/warning/success), read \`get_docs\` path \`theme-guidelines.md\`. Do not pick solid fills by eye.
`;

export function handleGetTheme(req: ThemeRequest) {
  try {
    if (req.operation === "guide") {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              withVelkinMcpMeta({ guide: THEME_GUIDE }, { truthLayer: "authoritative", source: "theme-tool" }),
              null,
              2,
            ),
          },
        ],
      };
    }

    if (req.operation === "preference") {
      const pref = req.preference ?? "system";
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              withVelkinMcpMeta(
                {
                  preference: pref,
                  htmlAttributes:
                    pref === "dark"
                      ? { "data-theme": "dark", "data-theme-dark": "" }
                      : pref === "light"
                        ? { "data-theme": "light", "data-theme-light": "" }
                        : { note: "Resolve via prefers-color-scheme when system" },
                  react: `<VuThemeProvider preference="${pref}" persist>`,
                  lit: `<vu-theme-provider preference="${pref}" persist>`,
                },
                { truthLayer: "heuristic" },
              ),
              null,
              2,
            ),
          },
        ],
      };
    }

    if (req.operation === "compose") {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              withVelkinMcpMeta(
                {
                  example: {
                    theme: {
                      primary: "oklch(62% 0.19 255)",
                      radius: "0.75rem",
                      dark: { primary: "oklch(70% 0.16 255)" },
                    },
                  },
                  react: `import { VuThemeProvider } from "@velkin/react/theme-provider";\n\n<VuThemeProvider theme={theme} persist>`,
                },
                { truthLayer: "heuristic" },
              ),
              null,
              2,
            ),
          },
        ],
      };
    }

    return mcpToolErr(McpErrorCode.THEME_GUIDE_FAILED, `Unknown operation: ${req.operation}`);
  } catch (err) {
    return mcpToolErr(McpErrorCode.THEME_GUIDE_FAILED, err instanceof Error ? err.message : String(err));
  }
}

export type ThemeTokensRequest = {
  category?: "colors" | "spacing" | "radius" | "all" | null;
};

export function handleGetThemeTokens(req: ThemeTokensRequest) {
  try {
    const category = req.category ?? "all";
    const response: Record<string, unknown> = {};

    if (category === "colors" || category === "all") {
      response.colors = {
        primitives: {
          "--vu-primitives-white": "oklch(100% 0 0)",
          "--vu-primitives-black": "oklch(0% 0 0)",
          "--vu-primitives-snow": "oklch(0.9911 0 0)",
          "--vu-primitives-eclipse": "oklch(0.27 0.065 285)"
        },
        semantic: {
          "--vu-color-background": "Background color of the application screen",
          "--vu-color-foreground": "Text/foreground color on main backgrounds",
          "--vu-color-surface": "Card/panel surface background color",
          "--vu-color-surface-foreground": "Text/foreground color on card surfaces",
          "--vu-color-accent": "Primary/accent theme color",
          "--vu-color-accent-foreground": "Foreground/text color on accent elements",
          "--vu-color-success": "Success color (e.g. green)",
          "--vu-color-warning": "Warning color (e.g. orange)",
          "--vu-color-danger": "Danger/error color (e.g. red)",
          "--vu-color-default": "Default neutral interactive color",
          "--vu-color-muted": "Muted text/border helper color",
          "--vu-color-border": "Standard border boundary color",
          "--vu-color-separator": "Divider/separator boundary color",
          "--vu-color-focus": "Outline/ring focus color for accessibility"
        },
        derived: {
          hover: {
            "--vu-color-surface-hover": "color-mix(in oklab, var(--vu-color-surface) 92%, var(--vu-color-surface-foreground) 8%)",
            "--vu-color-accent-hover": "color-mix(in oklab, var(--vu-color-accent) 90%, var(--vu-color-accent-foreground) 10%)",
            "--vu-color-success-hover": "color-mix(in oklab, var(--vu-color-success) 90%, var(--vu-color-success-foreground) 10%)",
            "--vu-color-danger-hover": "color-mix(in oklab, var(--vu-color-danger) 90%, var(--vu-color-danger-foreground) 10%)",
            "--vu-color-default-hover": "color-mix(in oklab, var(--vu-color-default) 96%, var(--vu-color-default-foreground) 4%)"
          },
          soft: {
            "--vu-color-accent-soft": "Accent color with 15% opacity",
            "--vu-color-accent-soft-foreground": "Optimized high-contrast text color on soft accent background",
            "--vu-color-danger-soft": "Danger color with 15% opacity",
            "--vu-color-success-soft": "Success color with 15% opacity",
            "--vu-color-warning-soft": "Warning color with 15% opacity"
          }
        }
      };
    }

    if (category === "spacing" || category === "all") {
      response.spacing = {
        base: {
          "--vu-spacing": "0.25rem (Base layout grid unit, equals 4px)"
        },
        multiples: {
          "--vu-space-1": "calc(var(--vu-spacing) * 1) [4px]",
          "--vu-space-2": "calc(var(--vu-spacing) * 2) [8px]",
          "--vu-space-3": "calc(var(--vu-spacing) * 3) [12px]",
          "--vu-space-4": "calc(var(--vu-spacing) * 4) [16px]",
          "--vu-space-5": "calc(var(--vu-spacing) * 5) [20px]",
          "--vu-space-6": "calc(var(--vu-spacing) * 6) [24px]",
          "--vu-space-8": "calc(var(--vu-spacing) * 8) [32px]",
          "--vu-space-10": "calc(var(--vu-spacing) * 10) [40px]",
          "--vu-space-12": "calc(var(--vu-spacing) * 12) [48px]",
          "--vu-space-16": "calc(var(--vu-spacing) * 16) [64px]",
          "--vu-space-20": "calc(var(--vu-spacing) * 20) [80px]",
          "--vu-space-24": "calc(var(--vu-spacing) * 24) [96px]"
        }
      };
    }

    if (category === "radius" || category === "all") {
      response.radius = {
        base: {
          "--vu-radius": "0.625rem (Base radius corner unit, equals 10px)"
        },
        variants: {
          "--vu-radius-xs": "calc(var(--vu-radius) * 0.25) [2.5px]",
          "--vu-radius-sm": "calc(var(--vu-radius) * 0.5) [5px]",
          "--vu-radius-md": "calc(var(--vu-radius) * 1) [10px]",
          "--vu-radius-lg": "calc(var(--vu-radius) * 1.25) [12.5px]",
          "--vu-radius-xl": "calc(var(--vu-radius) * 1.5) [15px]",
          "--vu-radius-2xl": "calc(var(--vu-radius) * 2) [20px]",
          "--vu-radius-3xl": "calc(var(--vu-radius) * 3) [30px]",
          "--vu-radius-4xl": "calc(var(--vu-radius) * 4) [40px]",
          "--vu-radius-full": "9999px",
          "--vu-radius-surface": "var(--vu-radius-2xl)",
          "--vu-radius-overlay": "var(--vu-radius-2xl)"
        },
        controls: {
          "--vu-control-radius-xs": "var(--vu-radius-sm) [5px]",
          "--vu-control-radius-sm": "var(--vu-radius-md) [10px]",
          "--vu-control-radius-md": "var(--vu-radius-xl) [15px]",
          "--vu-control-radius-lg": "calc(var(--vu-radius) * 1.75) [17.5px]"
        }
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            withVelkinMcpMeta({
              category,
              tokens: response
            }, { truthLayer: "authoritative", source: "theme-tool design-tokens" }),
            null,
            2
          )
        }
      ]
    };
  } catch (err) {
    return mcpToolErr(
      McpErrorCode.THEME_GUIDE_FAILED,
      err instanceof Error ? err.message : String(err)
    );
  }
}

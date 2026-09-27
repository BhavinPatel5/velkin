import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { resolveCorePackageRoot } from "./catalog.js";
import { withVelkinMcpMeta } from "./mcp-response-meta.js";
import { McpErrorCode, mcpToolErr } from "./mcp-tool-errors.js";

// Common fallback icons in case the local file cannot be read
const FALLBACK_ICONS = [
  "add",
  "arrow-back",
  "arrow-down",
  "arrow-forward",
  "arrow-up",
  "arrow-redo",
  "arrow-undo",
  "bulb",
  "calendar",
  "checkmark",
  "checkmark-circle",
  "chevron-back",
  "chevron-down",
  "chevron-forward",
  "chevron-up",
  "close",
  "close-circle",
  "cog",
  "copy",
  "document",
  "ellipsis-horizontal",
  "ellipsis-vertical",
  "eye",
  "eye-off",
  "heart",
  "home",
  "image",
  "information-circle",
  "lock-closed",
  "lock-open",
  "mail",
  "menu",
  "moon",
  "notifications",
  "options",
  "pencil",
  "person",
  "play",
  "search",
  "settings",
  "share",
  "star",
  "sunny",
  "trash",
  "warning",
  "volume-mute",
  "volume-medium",
  "volume-high",
];

function loadLocalIcons(): string[] {
  const coreRoot = resolveCorePackageRoot();
  if (coreRoot) {
    const srcPath = join(coreRoot, "src/icon/ion-local.json");
    if (existsSync(srcPath)) {
      try {
        const raw = JSON.parse(readFileSync(srcPath, "utf8")) as {
          icons?: Record<string, unknown>;
        };
        if (raw.icons) return Object.keys(raw.icons);
      } catch {
        /* ignore */
      }
    }
  }
  return FALLBACK_ICONS;
}

export type IconRequest = {
  query?: string | null;
  limit?: number | null;
};

export function handleSearchIcons(req: IconRequest) {
  try {
    const icons = loadLocalIcons();
    const q = req.query?.trim().toLowerCase() ?? "";
    const limit = req.limit ?? 20;
    const prefix = "ion:";

    const matched = q ? icons.filter((icon) => icon.includes(q)) : icons;

    const results = matched.slice(0, limit).map((name) => `${prefix}${name}`);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            withVelkinMcpMeta(
              {
                query: q,
                total: matched.length,
                icons: results,
                note: "Velkin uses the 'ion:' prefix for Ionicon elements (e.g. 'ion:home'). Use in 'icon' properties.",
              },
              { truthLayer: "authoritative" },
            ),
            null,
            2,
          ),
        },
      ],
    };
  } catch (err) {
    return mcpToolErr(
      McpErrorCode.THEME_GUIDE_FAILED, // Reusing error class matching server.ts behavior
      err instanceof Error ? err.message : String(err),
    );
  }
}

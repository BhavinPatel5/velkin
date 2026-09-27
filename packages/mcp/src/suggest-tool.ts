import { loadVelkinComponentsCached, type VelkinComponentEntry } from "./catalog.js";
import { withVelkinMcpMeta } from "./mcp-response-meta.js";
import { McpErrorCode, mcpToolErr } from "./mcp-tool-errors.js";

export type SuggestRequest = {
  description: string;
  tier?: "free" | "pro" | "all" | null;
  limit?: number | null;
};

export type SuggestResult = {
  slug: string;
  name: string;
  tag: string;
  tier: "free" | "pro";
  summary: string;
  score: number;
  rationale: string;
  reactImport: string | null;
  litImport: string;
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  input: ["input", "text", "type", "write", "enter", "field", "form", "fill"],
  button: ["button", "click", "action", "trigger", "submit", "cta", "call to action"],
  navigation: ["nav", "navigation", "menu", "sidebar", "tab", "route", "link", "breadcrumb"],
  selection: ["select", "choose", "pick", "option", "dropdown", "combo", "radio", "checkbox"],
  dialog: ["dialog", "modal", "popup", "overlay", "confirmation", "alert dialog"],
  data: ["table", "data", "grid", "row", "column", "list", "display", "show"],
  date: ["date", "time", "calendar", "picker", "schedule", "when"],
  feedback: ["toast", "notification", "alert", "banner", "message", "status"],
  media: ["image", "video", "media", "photo", "upload", "file"],
  layout: ["layout", "container", "grid", "flex", "card", "panel", "section"],
  theme: ["theme", "dark", "light", "color", "palette", "style"],
  search: ["search", "filter", "find", "query", "look up"],
  progress: ["progress", "loading", "spinner", "skeleton", "load"],
  tree: ["tree", "hierarchy", "nested", "expand", "collapse"],
  color: ["color", "colour", "hue", "palette", "swatch", "rgb", "hex"],
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function scoreSuggest(
  comp: VelkinComponentEntry,
  tokens: string[],
): { score: number; rationale: string[] } {
  const slugTokens = comp.slug.split("-");
  const nameTokens = tokenize(comp.name);
  const summaryTokens = tokenize(comp.summary);
  const category = (comp.category ?? "").toLowerCase();

  let score = 0;
  const rationale: string[] = [];

  for (const token of tokens) {
    // Exact slug/name match — highest value
    if (slugTokens.includes(token) || nameTokens.includes(token)) {
      score += 40;
      rationale.push(`name matches "${token}"`);
    } else if (comp.slug.includes(token) || comp.name.toLowerCase().includes(token)) {
      score += 25;
      rationale.push(`partially matches "${token}"`);
    }

    // Summary match
    if (summaryTokens.includes(token)) {
      score += 15;
      rationale.push(`summary contains "${token}"`);
    } else if (comp.summary.toLowerCase().includes(token)) {
      score += 8;
    }

    // Category keyword match
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.includes(token) && (category.includes(cat) || comp.slug.includes(cat))) {
        score += 20;
        rationale.push(`category "${cat}" matches intent`);
        break;
      }
    }
  }

  // Category boost for exact category match
  if (category && tokens.some((t) => category.includes(t))) {
    score += 10;
  }

  return { score, rationale: [...new Set(rationale)] };
}

export function handleSuggestComponent(req: SuggestRequest) {
  try {
    const desc = req.description?.trim();
    if (!desc || desc.length < 2) {
      return mcpToolErr(
        McpErrorCode.SUGGEST_FAILED,
        "Provide a description of at least 2 characters.",
      );
    }

    const limit = Math.min(Math.max(req.limit ?? 5, 1), 20);
    const tierFilter = req.tier ?? "all";
    const tokens = tokenize(desc);

    const components = loadVelkinComponentsCached();
    const filtered =
      tierFilter === "all" ? components : components.filter((c) => c.tier === tierFilter);

    const scored: SuggestResult[] = filtered
      .map((comp) => {
        const { score, rationale } = scoreSuggest(comp, tokens);
        return {
          slug: comp.slug,
          name: comp.name,
          tag: comp.tag,
          tier: comp.tier,
          summary: comp.summary,
          score,
          rationale: rationale.length ? rationale.join("; ") : "partial keyword overlap",
          reactImport: comp.reactImport,
          litImport: comp.litImport,
        };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    if (!scored.length) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              withVelkinMcpMeta(
                { suggestions: [], message: `No components matched "${desc}". Try broader terms.` },
                { truthLayer: "snapshot" },
              ),
              null,
              2,
            ),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            withVelkinMcpMeta(
              { query: desc, suggestions: scored },
              {
                truthLayer: "snapshot",
                agentMust:
                  "Call get_velkin_component_docs on top suggestion to verify props before using.",
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
      McpErrorCode.SUGGEST_FAILED,
      err instanceof Error ? err.message : String(err),
    );
  }
}

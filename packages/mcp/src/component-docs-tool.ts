import { getVelkinComponentDocs, getVelkinComponentDocsBatch, type DocsApiTables } from "./docs.js";
import { enrichComponentDoc, type EnrichedComponentDoc } from "./docs-site-enrichment.js";
import { McpErrorCode, mcpToolErr } from "./mcp-tool-errors.js";
import { withVelkinMcpMeta } from "./mcp-response-meta.js";

export type ComponentDocsRequest = {
  name?: string | null;
  names?: string[] | null;
  surface?: "props" | "events" | "slots" | "methods" | "parts" | "types" | null;
  enrich?: boolean | null;
};

function filterSurface<T extends { api: DocsApiTables }>(doc: T, surface?: string | null): T {
  if (!doc || !surface) return doc;
  const api = doc.api;
  const filtered = { ...doc, api: {} as DocsApiTables };
  if (surface === "props") filtered.api = { props: api.props };
  else if (surface === "events") filtered.api = { events: api.events };
  else if (surface === "slots") filtered.api = { slots: api.slots };
  else if (surface === "methods") filtered.api = { methods: api.methods };
  else if (surface === "parts") filtered.api = { parts: api.parts, cssProps: api.cssProps };
  else if (surface === "types") filtered.api = { typeDefs: api.typeDefs };
  return filtered;
}

export async function handleGetVelkinComponentDocs(req: ComponentDocsRequest) {
  try {
    const names = req.names?.length ? req.names : req.name ? [req.name] : [];
    if (!names.length) {
      return mcpToolErr(McpErrorCode.COMPONENT_DOCS_FAILED, "Provide name or names");
    }

    const enrich = req.enrich !== false;
    const docs = names.length === 1 ? getVelkinComponentDocs(names[0]!) : getVelkinComponentDocsBatch(names);
    const list = (Array.isArray(docs) ? docs : docs ? [docs] : []).filter(Boolean);
    if (!list.length) {
      return mcpToolErr(McpErrorCode.UNKNOWN_COMPONENT, `Unknown component: ${names.join(", ")}`, { names });
    }

    const enriched: EnrichedComponentDoc[] = enrich
      ? await Promise.all(list.map((d) => enrichComponentDoc(d!)))
      : list.map((d) => d!);

    const payload =
      enriched.length === 1
        ? filterSurface(enriched[0]!, req.surface)
        : enriched.map((d) => filterSurface(d, req.surface));

    const layer = enriched.some((d) => d.enrichmentLayer === "live") ? "live+snapshot" : "snapshot";

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            withVelkinMcpMeta(
              { components: Array.isArray(payload) ? payload : [payload] },
              {
                truthLayer: layer === "live+snapshot" ? "authoritative" : "snapshot",
                source: layer === "live+snapshot" ? "snapshot + mcp.velkinui.com/mcp" : "data/docs-snapshot.json",
                agentMust:
                  "Use api.* for props/events truth. Use snippets for copy-paste. Check tier before Pro imports. Call get_component_usage for alternate frameworks.",
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
      McpErrorCode.COMPONENT_DOCS_FAILED,
      err instanceof Error ? err.message : String(err),
    );
  }
}

import { resolveComponentEntry } from "./catalog.js";
import { getVelkinComponentDocs } from "./docs.js";
import { McpErrorCode, mcpToolErr } from "./mcp-tool-errors.js";
import { withVelkinMcpMeta } from "./mcp-response-meta.js";

export type UsageFramework = "lit" | "react" | "vue";

export type ComponentUsageRequest = {
  name: string;
  framework?: UsageFramework | null;
  variant?: string | null;
};

function litSnippet(tag: string, importPath: string, label: string): string {
  return `import "${importPath}";\n\n// In your Lit template:\nhtml\`<${tag}>${label}</${tag}>\``;
}

function reactSnippet(reactImport: string, reactName: string, label: string): string {
  const path = reactImport.replace("@velkin/react/", "");
  return `import { ${reactName} } from "@velkin/react/${path}";\n\nexport function Example() {\n  return <${reactName}>${label}</${reactName}>;\n}`;
}

function vueSnippet(slug: string, label: string): string {
  const pascal = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
  return `<script setup lang="ts">\nimport Vu${pascal} from "@velkin/vue/${slug}";\n</script>\n\n<template>\n  <Vu${pascal}>${label}</Vu${pascal}>\n</template>`;
}

export function handleGetComponentUsage(req: ComponentUsageRequest) {
  try {
    const resolved = resolveComponentEntry(req.name);
    if (!resolved) {
      return mcpToolErr(McpErrorCode.UNKNOWN_COMPONENT, `Unknown component: ${req.name}`, { name: req.name });
    }

    const fw = req.framework ?? "react";
    const { entry } = resolved;
    const label = entry.name;
    const doc = getVelkinComponentDocs(entry.slug);

    let snippet: string;
    const snapshotSnippet = doc?.snippets?.[fw];
    if (snapshotSnippet) {
      snippet = snapshotSnippet;
    } else if (fw === "lit") {
      snippet = litSnippet(entry.tag, entry.litImport, label);
    } else if (fw === "vue") {
      snippet = vueSnippet(entry.slug, label);
    } else if (fw === "react") {
      if (!entry.hasReact || !entry.reactImport) {
        return mcpToolErr(McpErrorCode.USAGE_SNIPPET_FAILED, `No React wrapper for ${entry.tag}`, {
          tag: entry.tag,
          tier: entry.tier,
        });
      }
      const reactName =
        "Vu" +
        entry.slug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join("");
      snippet = reactSnippet(entry.reactImport, reactName, label);
    } else {
      return mcpToolErr(McpErrorCode.USAGE_SNIPPET_INVALID_FRAMEWORK, `Unknown framework: ${fw}`);
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            withVelkinMcpMeta(
              {
                component: entry.slug,
                tag: entry.tag,
                tier: entry.tier,
                framework: fw,
                snippet,
                imports: {
                  lit: entry.litImport,
                  react: entry.reactImport,
                  vue: entry.vueImport,
                },
              },
              {
                truthLayer: snapshotSnippet ? "snapshot" : "heuristic",
                source: snapshotSnippet ? "data/docs-snapshot.json snippets" : undefined,
                agentMust: "Adapt snippet to your app shell (theme provider, bundler plugins). Verify props via get_velkin_component_docs.",
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
      McpErrorCode.COMPONENT_USAGE_FAILED,
      err instanceof Error ? err.message : String(err),
    );
  }
}

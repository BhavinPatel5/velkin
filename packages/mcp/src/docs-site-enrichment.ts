import type { ComponentDocumentation } from "./docs.js";
import { fetchDocsSiteComponent } from "./docs-site-fetch.js";

export type EnrichedComponentDoc = ComponentDocumentation & {
  docsUrl?: string;
  snippets?: { react?: string | null; lit?: string; vue?: string };
  agentHints?: string[];
  related?: string[];
  dependencies?: string[];
  docsSiteSource?: string;
  enrichmentLayer?: "live" | "snapshot-only";
};

export async function enrichComponentDoc(doc: ComponentDocumentation): Promise<EnrichedComponentDoc> {
  const base: EnrichedComponentDoc = {
    ...doc,
    enrichmentLayer: "snapshot-only",
    agentHints: buildSnapshotHints(doc),
    dependencies: extractDependencies(doc),
    docsUrl: `https://velkinui.com/docs/components/${doc.slug}`,
  };

  const live = await fetchDocsSiteComponent(doc.slug);
  if (!live.ok) {
    return {
      ...base,
      snippets: doc.snippets ?? base.snippets,
      agentHints: doc.agentHints?.length ? doc.agentHints : base.agentHints,
      dependencies: doc.dependencies?.length ? doc.dependencies : base.dependencies,
    };
  }

  return {
    ...base,
    ...doc,
    summary: live.body.description || doc.summary,
    docsUrl: live.body.docsUrl ?? base.docsUrl,
    snippets: live.body.snippets ?? doc.snippets,
    agentHints: live.body.agentHints?.length ? live.body.agentHints : doc.agentHints ?? base.agentHints,
    related: live.body.related,
    dependencies: live.body.dependencies?.length ? live.body.dependencies : doc.dependencies ?? base.dependencies,
    docsSiteSource: live.url,
    enrichmentLayer: "live",
  };
}

function extractDependencies(doc: ComponentDocumentation): string[] {
  return (doc.api.meta ?? [])
    .filter((m) => m.label === "Dependency")
    .map((m) => m.value);
}

function buildSnapshotHints(doc: ComponentDocumentation): string[] {
  const hints = [
    "Import by subpath — avoid @velkin/react or @velkin/ui root barrels.",
    `Tag: <${doc.tag}>.`,
  ];
  if (doc.tier === "pro") {
    hints.push("Pro: install @velkin/ui-pro + valid license for production.");
  }
  if (doc.hasReact && doc.reactImport) {
    hints.push(`React: ${doc.reactImport}`);
  }
  return hints;
}

#!/usr/bin/env node
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { completable } from "@modelcontextprotocol/sdk/server/completable.js";
import {
  getMainPackageVersion,
  loadVelkinComponentsCached,
  normalizeComponentKey,
  resolveComponentEntry,
  resolveCorePackageRoot,
} from "./catalog.js";
import { handleGetVelkinComponentDocs } from "./component-docs-tool.js";
import { handleGetComponentUsage } from "./component-usage-tool.js";
import { listAllComponentDocs, searchComponentsByApi, searchVelkinComponents, getVelkinComponentDocs } from "./docs.js";
import { getDocsPage, listDocsPaths } from "./docs-read.js";
import { readCustomElementsManifestText, readDocsSnapshotText, readCustomElementsManifestFromRoots, readCustomElementsManifest } from "./cem.js";
import { McpErrorCode, mcpToolErr } from "./mcp-tool-errors.js";
import { withVelkinMcpMeta } from "./mcp-response-meta.js";
import { handleGetTheme, handleGetThemeTokens } from "./theme-tool.js";
import { handleGetRecipes } from "./recipes-tool.js";
import { READ_ONLY_TOOL_NAMES } from "./read-only-tool-allowlist.js";
import { handleVelkinLint } from "./lint-tool.js";
import { handleSearchIcons } from "./icon-tool.js";
import { handleSuggestComponent } from "./suggest-tool.js";
import { handleValidateComponentUsage } from "./validate-tool.js";
import { handleDiffComponentMigration } from "./diff-tool.js";
import { handleGetChangelog } from "./changelog-tool.js";
import { handleGetA11yGuide } from "./a11y-tool.js";
import { handleGetComponentDependencies } from "./dependency-tool.js";

const instructions = `Velkin MCP — authoritative UI knowledge for AI coding assistants.

## Packages
- MIT: @velkin/ui, @velkin/react, @velkin/vue
- Pro (commercial): @velkin/ui-pro — data-table, date-picker, tree, etc.

## Decision tree (follow in order)

### Discovery & Planning
1. **Describe need, unknown component** → suggest_component (natural-language → ranked suggestions)
2. **Find by name / search** → velkin_components (list|search|search_by_api)
3. **Component dependency tree** → get_component_dependencies (what children/parents does it need?)

### API Truth
4. **Props, events, slots** → get_velkin_component_docs (enrich:true — never invent)
5. **Validate props before generating code** → validate_component_usage (check types, unknown props, enums)

### Code Generation
6. **Starter snippets** → get_component_usage OR snippets from step 4
7. **Multi-component patterns** → get_recipes (list then get by id)

### Quality & Compliance
8. **Validate generated code** → velkin_lint (7 rules: imports, events, a11y, style, pro tier)
9. **Accessibility** → get_a11y_guide (ARIA roles, keyboard patterns, WCAG refs)

### Migration & Upgrades
10. **Breaking changes between versions** → get_changelog (semver range + component filter)
11. **Compare before/after code** → diff_component_migration (surfaces unknown props, dropped events)

### Styling & Assets
12. **Theme / dark mode** → get_theme
13. **Design tokens (--vu-* variables)** → get_theme_tokens
14. **Icon names** → search_icons (returns "ion:" prefixed strings)

### Setup & Guides
15. **Install / bundler setup** → get_project_guide (lit|react|vue|next)
16. **Long guides** → get_docs (agent-workflow.md, ai-checklist.md, theme-guidelines.md, react-integration.md)

## Import rules (critical)
  import { VuButton } from "@velkin/react/button"   // ✅ subpath
  import VuButton from "@velkin/vue/button"
  import "@velkin/ui/button"
  // ❌ Never: import from "@velkin/react" root barrel

## React events
Lit events → onVu* in React (vu-change → onVuChange). Payload in e.detail (not e.target).

## Truth layers (_velkinMcp.truthLayer)
- authoritative — guides, recipes, live-enriched docs, a11y, lint
- snapshot — data/docs-snapshot.json (offline-safe API tables)
- heuristic — generated usage; verify against get_velkin_component_docs

## Pro tier
When tier==="pro", use @velkin/ui-pro and add // @velkin-pro comment near imports.

## Optimal agent workflow
suggest_component → get_component_dependencies → get_velkin_component_docs → validate_component_usage → get_component_usage → velkin_lint → get_a11y_guide

Read-only server. Always call get_velkin_component_docs before using unfamiliar props.`;

const optionalBoolean = () => z.boolean().nullish();

export function assertCoreDependencyAvailable(): void {
  const hasSnapshot = loadVelkinComponentsCached().length > 0;
  if (hasSnapshot) return;
  throw new Error(
    [
      "Velkin MCP docs snapshot missing.",
      "Install @velkin/mcp and run its build, or install @velkin/ui alongside it.",
      "Example: npm install @velkin/mcp @velkin/ui",
    ].join("\n"),
  );
}

type Framework = "lit" | "react" | "vue" | "next";

function parseFramework(input?: string | null): Framework | null {
  if (!input) return "react";
  const v = input.toLowerCase().replace(/[^a-z]/g, "");
  if (["lit", "litelement", "webcomponent"].includes(v)) return "lit";
  if (["react", "reactjs"].includes(v)) return "react";
  if (["vue", "vue3"].includes(v)) return "vue";
  if (["next", "nextjs"].includes(v)) return "next";
  return null;
}

function installationGuide(framework: Framework): string {
  const lines: string[] = ["# Velkin installation", ""];
  if (framework === "lit") {
    lines.push(
      "npm install @velkin/ui lit",
      "",
      'import "@velkin/ui/button";',
      "",
      "Use <vu-button> in Lit templates.",
      "Vite/webpack/rollup: velkin() from @velkin/ui/{vite,webpack,rollup}.",
    );
  } else if (framework === "react") {
    lines.push(
      "npm install @velkin/ui @velkin/react lit @lit/react",
      "",
      'import { VuThemeProvider } from "@velkin/react/theme-provider";',
      'import { VuButton } from "@velkin/react/button";',
      "",
      "Wrap app with VuThemeProvider persist.",
      "Vite: velkin() from @velkin/ui/vite + velkinReact() from @velkin/react/vite.",
      "Webpack/Rollup: same factories from /webpack or /rollup.",
    );
  } else if (framework === "vue") {
    lines.push(
      "npm install @velkin/ui @velkin/vue lit",
      "",
      'import VuButton from "@velkin/vue/button";',
      "",
      "Wrap app with VuThemeProvider from @velkin/vue/theme-provider.",
      "Vite: velkin() from @velkin/ui/vite + velkinVue() from @velkin/vue/vite.",
      "Webpack/Rollup: same factories from /webpack or /rollup.",
    );
  } else {
    lines.push(
      "npm install @velkin/ui @velkin/react lit @lit/react",
      "",
      'import { defineVelkin } from "@velkin/react/next";',
      "export default defineVelkin({ /* next config */ });",
      "",
      "// instrumentation-client.ts",
      'import "@velkin/react/ssr/client";',
      "",
      'import { VuThemeHead, htmlThemeProps } from "@velkin/react/theme-head";',
      "Use VuThemeProvider persist + VuThemeHead in <head> + htmlThemeProps on <html> (FOUC-safe).",
      "Run next with --webpack.",
    );
  }
  lines.push("", "Pro: npm install @velkin/ui-pro (requires license for production).");
  return lines.join("\n");
}

function bundlerGuide(framework: Framework): string {
  const shared = "Same factory on every bundler — only the import path changes.";
  if (framework === "next") {
    return [
      "## Bundler",
      "Use defineVelkin from @velkin/react/next (adds velkin() + velkinReact() on webpack).",
      "Vite/Rollup apps: same factories from @velkin/ui/{vite,rollup} + @velkin/react/{vite,rollup}.",
      "Pro: velkinPro() from @velkin/ui-pro/{vite,webpack,rollup}.",
    ].join("\n");
  }
  if (framework === "vue") {
    return [
      "## Bundler plugins",
      shared,
      "",
      'import { velkin } from "@velkin/ui/vite";',
      'import { velkinVue } from "@velkin/vue/vite";',
      'plugins: [vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith("vu-") } } }), velkin(), velkinVue()].flat()',
      "",
      "Webpack/Rollup: same factories from /webpack or /rollup.",
      "Pro: velkinPro() from @velkin/ui-pro/{vite,webpack,rollup}.",
    ].join("\n");
  }
  if (framework === "lit") {
    return [
      "## Bundler plugins",
      shared,
      "",
      'import { velkin } from "@velkin/ui/vite"; // or /webpack / /rollup',
      "plugins: [velkin()]",
      "",
      "Pro: velkinPro() from @velkin/ui-pro/{vite,webpack,rollup}.",
    ].join("\n");
  }
  return [
    "## Bundler plugins",
    shared,
    "",
    'import { velkin } from "@velkin/ui/vite";',
    'import { velkinReact } from "@velkin/react/vite";',
    "plugins: [react(), velkin(), velkinReact()].flat()",
    "",
    "Webpack/Rollup: same factories from /webpack or /rollup.",
    "Next.js: defineVelkin from @velkin/react/next.",
    "Pro: velkinPro() from @velkin/ui-pro/{vite,webpack,rollup}.",
  ].join("\n");
}

export function createVelkinMcpServer(): McpServer {
  const server = new McpServer({ name: "velkin", version: "1.0.0" }, { instructions });

  // Dynamically wrap registerTool to automatically send log notifications
  const originalRegisterTool = server.registerTool.bind(server);
  server.registerTool = (name: any, config: any, cb: any): any => {
    return originalRegisterTool(name, config, async (...toolArgs: any[]) => {
      const hasInput = config && config.inputSchema;
      try {
        await server.sendLoggingMessage({
          level: "info",
          logger: "velkin-mcp",
          data: `Executing tool "${name}"` + (hasInput ? ` with arguments: ${JSON.stringify(toolArgs[0])}` : "")
        });
      } catch { /* ignore if not supported */ }
      return cb(...toolArgs);
    });
  };

  server.registerTool(
    "get_project_guide",
    {
      title: "Project guide",
      description: "Installation and bundler setup for Velkin (lit, react, vue, next).",
      inputSchema: {
        kind: z.enum(["installation", "setup"]),
        framework: z.string().nullish(),
      },
    },
    async ({ kind, framework }) => {
      const fw = parseFramework(framework);
      if (!fw) {
        return mcpToolErr(McpErrorCode.INSTALL_GUIDE_INVALID_FRAMEWORK, `Unknown framework: ${framework}`);
      }
      const text =
        kind === "installation"
          ? installationGuide(fw)
          : `${installationGuide(fw)}\n\n${bundlerGuide(fw)}`;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(withVelkinMcpMeta({ kind, framework: fw, guide: text }, { truthLayer: "authoritative" }), null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "velkin_components",
    {
      title: "Component catalog",
      description: "List, search, or API-search Velkin components. Use operation='list_experimental' to see all components not yet stable.",
      inputSchema: {
        operation: z.enum(["list", "search", "search_by_api", "list_experimental"]),
        query: z.string().nullish(),
        tier: z.enum(["free", "pro", "all"]).nullish(),
        limit: z.number().int().min(1).max(100).nullish(),
        offset: z.number().int().min(0).nullish(),
      },
    },
    async ({ operation, query, tier, limit, offset }) => {
      try {
        const max = limit ?? 30;
        const skip = offset ?? 0;
        let components = loadVelkinComponentsCached();
        if (tier && tier !== "all") components = components.filter((c) => c.tier === tier);

        if (operation === "list_experimental") {
          const experimental = components.filter((c) => c.status === "experimental");
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  withVelkinMcpMeta(
                    {
                      total: experimental.length,
                      warning: "These components have unstable APIs. Do not use in production without explicit acknowledgement.",
                      components: experimental.map((c) => ({
                        slug: c.slug,
                        tag: c.tag,
                        name: c.name,
                        tier: c.tier,
                        status: c.status,
                        since: c.since,
                        summary: c.summary,
                        litImport: c.litImport,
                        reactImport: c.reactImport,
                      })),
                    },
                    { truthLayer: "snapshot", source: "data/docs-snapshot.json" },
                  ),
                  null,
                  2,
                ),
              },
            ],
          };
        }

        if (operation === "list") {
          const slice = components.slice(skip, skip + max);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  withVelkinMcpMeta(
                    { total: components.length, offset: skip, components: slice.map((c) => ({ ...c, statusBadge: c.status !== "stable" ? `⚠️ ${c.status}` : undefined })) },
                    { truthLayer: "snapshot", source: "data/docs-snapshot.json" },
                  ),
                  null,
                  2,
                ),
              },
            ],
          };
        }

        if (operation === "search") {
          const q = query?.trim() ?? "";
          const hits = q ? searchVelkinComponents(q, max) : [];
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(withVelkinMcpMeta({ query: q, results: hits }, { truthLayer: "snapshot" }), null, 2),
              },
            ],
          };
        }

        const q = query?.trim() ?? "";
        const hits = searchComponentsByApi(q, max);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(withVelkinMcpMeta({ query: q, results: hits }, { truthLayer: "snapshot" }), null, 2),
            },
          ],
        };
      } catch (err) {
        return mcpToolErr(McpErrorCode.COMPONENT_CATALOG_FAILED, err instanceof Error ? err.message : String(err));
      }
    },
  );

  server.registerTool(
    "get_velkin_component_docs",
    {
      title: "Component API docs",
      description: "Props, slots, events, methods, CSS parts, and types for one or more components.",
      inputSchema: {
        name: z.string().nullish(),
        names: z.array(z.string()).nullish(),
        surface: z.enum(["props", "events", "slots", "methods", "parts", "types"]).nullish(),
        enrich: optionalBoolean(),
      },
    },
    async (input) => handleGetVelkinComponentDocs(input),
  );

  server.registerTool(
    "get_component_usage",
    {
      title: "Usage snippets",
      description: "Starter lit/react/vue snippets for a component.",
      inputSchema: {
        name: z.string(),
        framework: z.enum(["lit", "react", "vue"]).nullish(),
        variant: z.string().nullish(),
      },
    },
    async (input) => handleGetComponentUsage(input),
  );

  server.registerTool(
    "get_recipes",
    {
      title: "Composition recipes",
      description: "Curated multi-component patterns (app shell, forms, dialogs, Pro data-table).",
      inputSchema: {
        operation: z.enum(["list", "get"]),
        id: z.string().nullish(),
      },
    },
    async (input) => handleGetRecipes(input),
  );

  server.registerTool(
    "get_theme",
    {
      title: "Theme provider",
      description: "VuThemeProvider guide, preference helpers, and VuThemeConfig compose example.",
      inputSchema: {
        operation: z.enum(["guide", "preference", "compose"]),
        preference: z.enum(["light", "dark", "system"]).nullish(),
      },
    },
    async (input) => handleGetTheme(input),
  );

  server.registerTool(
    "get_theme_tokens",
    {
      title: "Design Tokens",
      description: "Retrieve Velkin theme tokens (colors, spacing, corners).",
      inputSchema: {
        category: z.enum(["colors", "spacing", "radius", "all"]).nullish().describe("Filter tokens by category (default: all)"),
      },
    },
    async (input) => handleGetThemeTokens(input),
  );

  server.registerTool(
    "velkin_lint",
    {
      title: "Velkin Code Linter",
      description: "Analyze code files or strings for incorrect Velkin imports, event handlers, and props.",
      inputSchema: {
        code: z.string().nullish().describe("Raw source code to lint"),
        filePath: z.string().nullish().describe("Absolute file path to read and lint from"),
        framework: z.enum(["react", "vue", "lit"]).nullish().describe("Target framework context (default: react)"),
      },
    },
    async (input) => handleVelkinLint(input),
  );

  server.registerTool(
    "search_icons",
    {
      title: "Velkin Icons",
      description: "Search for approved Velkin icons.",
      inputSchema: {
        query: z.string().nullish().describe("Substring query to match icons (e.g. 'arrow', 'home')"),
        limit: z.number().int().min(1).max(100).nullish().describe("Limit search results (default: 20)"),
      },
    },
    async (input) => handleSearchIcons(input),
  );

  server.registerTool(
    "suggest_component",
    {
      title: "Component suggester",
      description:
        "Given a natural-language description of a UI need, returns ranked Velkin component suggestions with rationale. Use this when the user describes what they want rather than naming a component directly.",
      inputSchema: {
        description: z.string().describe("Natural language description of the UI element or behavior needed (e.g. 'filterable dropdown with search')"),
        tier: z.enum(["free", "pro", "all"]).nullish().describe("Filter by license tier (default: all)"),
        limit: z.number().int().min(1).max(20).nullish().describe("Max suggestions to return (default: 5)"),
      },
    },
    async (input) => handleSuggestComponent(input),
  );

  server.registerTool(
    "validate_component_usage",
    {
      title: "Component usage validator",
      description:
        "Validates a set of props against the Velkin component schema. Detects unknown props, type mismatches, and invalid enum values before code generation.",
      inputSchema: {
        component: z.string().describe("Component slug, tag, or name (e.g. 'button', 'vu-input', 'VuDialog')"),
        props: z.record(z.string(), z.unknown()).describe("Key-value map of props to validate (e.g. { variant: 'ghost', size: 'sm' })"),
      },
    },
    async (input) => handleValidateComponentUsage(input),
  );

  server.registerTool(
    "diff_component_migration",
    {
      title: "Component migration diff",
      description:
        "Compares two code snippets of the same Velkin component (before/after a refactor or version upgrade) and surfaces breaking changes, unknown props, and dropped events.",
      inputSchema: {
        component: z.string().describe("Component slug or tag (e.g. 'button', 'vu-dialog')"),
        fromCode: z.string().describe("The original/old code snippet using the component"),
        toCode: z.string().describe("The new/updated code snippet to validate"),
      },
    },
    async (input) => handleDiffComponentMigration(input),
  );

  server.registerTool(
    "get_changelog",
    {
      title: "Changelog",
      description:
        "Reads and parses the @velkin/ui CHANGELOG.md. Filter by version range or component name to surface breaking changes for upgrade planning.",
      inputSchema: {
        fromVersion: z.string().nullish().describe("Minimum version (inclusive), e.g. '1.0.0'"),
        toVersion: z.string().nullish().describe("Maximum version (inclusive), e.g. '2.0.0'"),
        component: z.string().nullish().describe("Filter entries to a specific component slug (e.g. 'button', 'dialog')"),
      },
    },
    async (input) => handleGetChangelog(input),
  );

  server.registerTool(
    "get_a11y_guide",
    {
      title: "Accessibility guide",
      description:
        "Returns ARIA roles, required attributes, keyboard interaction patterns, WCAG references, and practical tips for a Velkin component. Essential for building accessible UIs.",
      inputSchema: {
        component: z.string().describe("Component slug, tag, or name (e.g. 'dialog', 'vu-button', 'DatePicker')"),
      },
    },
    async (input) => handleGetA11yGuide(input),
  );

  server.registerTool(
    "get_component_dependencies",
    {
      title: "Component dependency graph",
      description:
        "Returns a component's dependency graph — which components it uses internally (children/composition) and which components use it as a child. Essential for planning multi-component compositions.",
      inputSchema: {
        component: z.string().describe("Component slug, tag, or name (e.g. 'dialog', 'accordion', 'form')"),
        direction: z
          .enum(["uses", "usedBy", "both"])
          .nullish()
          .describe("Which direction to traverse: 'uses' (children), 'usedBy' (parents), or 'both' (default)"),
      },
    },
    async (input) => handleGetComponentDependencies(input),
  );

  server.registerTool(
    "get_docs",
    {
      title: "Guides",
      description: "Read allowlisted markdown guides shipped with @velkin/mcp.",
      inputSchema: {
        path: z.string().nullish(),
        list: optionalBoolean(),
      },
    },
    async ({ path, list }) => {
      try {
        if (list) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ paths: listDocsPaths() }, null, 2),
              },
            ],
          };
        }
        const p = path ?? "installation.md";
        const page = getDocsPage(p);
        if (!page) return mcpToolErr(McpErrorCode.DOCS_READ_FAILED, `Unknown doc: ${p}`, { available: listDocsPaths() });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(withVelkinMcpMeta(page, { truthLayer: "authoritative", source: `docs/${page.path}` }), null, 2),
            },
          ],
        };
      } catch (err) {
        return mcpToolErr(McpErrorCode.DOCS_READ_FAILED, err instanceof Error ? err.message : String(err));
      }
    },
  );

  server.registerResource(
    "velkin-tools-catalog",
    "velkin://catalog/tools",
    { mimeType: "application/json", description: "Registered MCP tools" },
    async () => ({
      contents: [
        {
          uri: "velkin://catalog/tools",
          mimeType: "application/json",
          text: JSON.stringify(
            READ_ONLY_TOOL_NAMES.map((name) => ({ name })),
            null,
            2,
          ),
        },
      ],
    }),
  );

  server.registerResource(
    "velkin-component-catalog",
    "velkin://catalog/components",
    { mimeType: "application/json", description: "Full component catalog snapshot" },
    async () => ({
      contents: [
        {
          uri: "velkin://catalog/components",
          mimeType: "application/json",
          text: JSON.stringify(
            withVelkinMcpMeta(
              { version: getMainPackageVersion(), components: listAllComponentDocs() },
              { truthLayer: "snapshot" },
            ),
            null,
            2,
          ),
        },
      ],
    }),
  );

  server.registerResource(
    "velkin-component-api-template",
    new ResourceTemplate("velkin://components/{slug}/api", {
      list: () => ({
        resources: loadVelkinComponentsCached().map((c) => ({
          uri: `velkin://components/${c.slug}/api`,
          name: `${c.name} API Reference`,
          mimeType: "application/json",
          description: `API reference tables for ${c.tag}`,
        })),
      }),
      complete: {
        slug: async (value) => {
          const comps = loadVelkinComponentsCached().map((c) => c.slug);
          return comps.filter((slug) => slug.includes(value.toLowerCase()));
        },
      },
    }),
    { mimeType: "application/json", description: "API reference resource template for Velkin components" },
    async (uri, variables) => {
      const slug = String(variables.slug ?? "");
      const doc = getVelkinComponentDocs(slug);
      if (!doc) {
        throw new Error(`Component slug "${slug}" not found`);
      }
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(withVelkinMcpMeta(doc, { truthLayer: "snapshot" }), null, 2),
          },
        ],
      };
    }
  );

  server.registerResource(
    "velkin-custom-elements-manifest",
    "velkin://manifest/custom-elements.json",
    { mimeType: "application/json", description: "CEM from installed @velkin/ui or workspace roots" },
    async () => {
      let manifest: unknown = null;
      try {
        const rootsResult = await server.server.listRoots();
        if (rootsResult && rootsResult.roots) {
          manifest = readCustomElementsManifestFromRoots(rootsResult.roots);
        }
      } catch { /* ignore if roots are not supported by the client */ }

      if (!manifest) {
        manifest = readCustomElementsManifest();
      }

      return {
        contents: [
          {
            uri: "velkin://manifest/custom-elements.json",
            mimeType: "application/json",
            text: manifest
              ? JSON.stringify(manifest, null, 2)
              : JSON.stringify({ error: "custom-elements.json not found — build @velkin/ui first" }),
          },
        ],
      };
    },
  );

  server.registerResource(
    "velkin-docs-snapshot",
    "velkin://data/docs-snapshot.json",
    { mimeType: "application/json", description: "Shipped docs API snapshot" },
    async () => ({
      contents: [
        {
          uri: "velkin://data/docs-snapshot.json",
          mimeType: "application/json",
          text: readDocsSnapshotText(),
        },
      ],
    }),
  );

  server.registerResource(
    "velkin-prompts-catalog",
    "velkin://prompts/catalog",
    { mimeType: "application/json", description: "All Velkin MCP agent prompt templates and tool call sequences" },
    async () => ({
      contents: [
        {
          uri: "velkin://prompts/catalog",
          mimeType: "application/json",
          text: JSON.stringify({
            description: "Velkin MCP prompt templates catalog — use these sequences for common tasks",
            templates: [
              {
                id: "new-component",
                title: "Build a new component",
                steps: ["suggest_component (describe need)", "get_velkin_component_docs (verify API)", "validate_component_usage (check props)", "get_component_usage (get snippet)", "velkin_lint (validate code)"],
              },
              {
                id: "accessibility-review",
                title: "Accessibility review",
                steps: ["get_a11y_guide (get ARIA + keyboard patterns)", "velkin_lint (run rule checks)", "get_velkin_component_docs (verify props used)"],
              },
              {
                id: "upgrade-migration",
                title: "Upgrade / migration",
                steps: ["get_changelog (surface breaking changes)", "diff_component_migration (compare before/after code)", "validate_component_usage (validate new props)", "velkin_lint (check for deprecated patterns)"],
              },
              {
                id: "composition-planning",
                title: "Multi-component composition",
                steps: ["get_component_dependencies (find required children)", "get_velkin_component_docs (for each component)", "get_recipes (find matching recipe)", "validate_component_usage (validate all props)"],
              },
              {
                id: "theming",
                title: "Theming and design tokens",
                steps: ["get_theme (full theme structure)", "get_theme_tokens (list --vu-* variables)", "search_icons (find icon strings)"],
              },
              {
                id: "project-setup",
                title: "Project setup",
                steps: ["get_project_guide (installation + bundler)", "get_docs: react-integration.md (React-specific)", "get_docs: ai-checklist.md (agent validation checklist)"],
              },
            ],
          }, null, 2),
        },
      ],
    }),
  );

  server.registerPrompt(
    "velkin_tool_router",
    {
      title: "Tool router",
      description: "Map user intent to the right Velkin MCP tool.",
    },
    async () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Route Velkin requests to the correct tool. Follow this priority order:

DISCOVERY
- User describes a UI need without naming a component → suggest_component
- User names a component or searches → velkin_components (list|search|search_by_api)
- User asks what a component needs inside it → get_component_dependencies

API TRUTH (always do before writing code)
- Props, events, slots for a component → get_velkin_component_docs (enrich:true)
- Verify props are valid before code gen → validate_component_usage

CODE GENERATION
- Starter snippets (React/Lit/Vue) → get_component_usage
- App-level patterns (form, shell, dashboard) → get_recipes

QUALITY
- Lint generated code → velkin_lint
- Accessibility audit → get_a11y_guide
- Validate props → validate_component_usage

MIGRATION / UPGRADES
- What changed between versions → get_changelog
- Compare old vs new code → diff_component_migration

STYLING & ASSETS
- Theme / dark mode setup → get_theme
- CSS custom property tokens → get_theme_tokens
- Icon name lookup → search_icons

SETUP & GUIDES
- Install / bundler → get_project_guide (lit|react|vue|next)
- Long guides → get_docs (agent-workflow.md, ai-checklist.md, theme-guidelines.md, react-integration.md)

OPTIMAL FULL WORKFLOW:
suggest_component → get_component_dependencies → get_velkin_component_docs → validate_component_usage → get_component_usage → velkin_lint → get_a11y_guide`,
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "velkin_component_starter",
    {
      title: "Component starter",
      description: "Generate a starter prompt for a Velkin component.",
      argsSchema: {
        component: completable(
          z.string().describe("Component slug or tag"),
          async (value) => {
            const comps = loadVelkinComponentsCached().map((c) => c.slug);
            return comps.filter((slug) => slug.includes(String(value).toLowerCase()));
          }
        )
      },
    },
    async ({ component }) => {
      const resolved = resolveComponentEntry(component ?? "");
      const name = resolved?.entry.slug ?? normalizeComponentKey(component ?? "button");
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Build a UI using Velkin ${name}. Workflow: get_velkin_component_docs → get_component_usage → get_docs ai-checklist.md. Respect tier (free vs pro). Subpath imports only.`,
            },
          },
        ],
      };
    },
  );

  return server;
}

export async function startVelkinMcpStdio(): Promise<void> {
  assertCoreDependencyAvailable();
  const server = createVelkinMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

const isDirectRun = process.argv[1]?.includes("server");
if (isDirectRun) {
  startVelkinMcpStdio().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}

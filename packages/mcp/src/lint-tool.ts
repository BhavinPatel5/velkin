import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { withVelkinMcpMeta } from "./mcp-response-meta.js";
import { McpErrorCode, mcpToolErr } from "./mcp-tool-errors.js";
import { loadVelkinComponentsCached } from "./catalog.js";

export type LintRequest = {
  code?: string | null;
  filePath?: string | null;
  framework?: "react" | "vue" | "lit" | null;
};

export type LintFinding = {
  ruleId: string;
  severity: "warning" | "error";
  message: string;
  line?: number;
  snippet?: string;
  fixSuggestion?: string;
};

export function handleVelkinLint(req: LintRequest) {
  try {
    let sourceCode = req.code ?? "";
    let fileCtx = "raw input";

    if (req.filePath) {
      const absPath = resolve(req.filePath);
      if (!existsSync(absPath)) {
        return mcpToolErr(
          McpErrorCode.DOCS_READ_FAILED,
          `File not found at path: ${req.filePath}`,
          { filePath: req.filePath },
        );
      }
      sourceCode = readFileSync(absPath, "utf8");
      fileCtx = req.filePath;
    }

    if (!sourceCode.trim()) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              withVelkinMcpMeta(
                {
                  file: fileCtx,
                  findings: [],
                  message: "No source code provided or file is empty.",
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

    const findings: LintFinding[] = [];
    const lines = sourceCode.split("\n");

    // 1. Rule: Avoid Root Barrel Imports
    // Matches: import { ... } from "@velkin/react" or "@velkin/vue" or "@velkin/ui"
    const rootImportRegex = /import\s+{[^}]+}\s+from\s+['"](@velkin\/(react|vue|ui))['"]/g;
    lines.forEach((line, idx) => {
      let match;
      rootImportRegex.lastIndex = 0;
      while ((match = rootImportRegex.exec(line)) !== null) {
        const pkg = match[1];
        findings.push({
          ruleId: "no-root-barrel-imports",
          severity: "warning",
          message: `Root barrel import detected from "${pkg}". Root imports increase bundle size and can lead to build issues.`,
          line: idx + 1,
          snippet: line.trim(),
          fixSuggestion: `Import individual components from subpaths, e.g. import { VuButton } from "${pkg}/button";`,
        });
      }
    });

    // 2. Rule: Event Handler Mismatch (Native vs onVu*)
    // Matches React: <VuInput ... onChange={...} /> or Vue/HTML: <vu-input ... @change="..." />
    // Check for common input components: Input, Switch, Checkbox, Slider, Range, Combobox, Otp, ColorPicker
    const reactNativeEventRegex =
      /<(Vu(Input|Switch|Checkbox|Slider|Range|Combobox|Otp|ColorPicker))\b[^>]*?\b(onChange|onInput)\s*=\s*{/g;
    const vueNativeEventRegex =
      /<(vu-(input|switch|checkbox|slider|range|combobox|otp|color-picker))\b[^>]*?\b(@change|@input|v-on:change|v-on:input|onchange|oninput)\b/g;

    lines.forEach((line, idx) => {
      let match;
      reactNativeEventRegex.lastIndex = 0;
      while ((match = reactNativeEventRegex.exec(line)) !== null) {
        const comp = match[1];
        const attr = match[3]; // group 3 is the event name because of nested Vu(Input|...) group
        findings.push({
          ruleId: "use-vu-events-react",
          severity: "error",
          message: `Velkin component "${comp}" uses native handler "${attr}". Custom elements map their change/input events to "onVuChange".`,
          line: idx + 1,
          snippet: line.trim(),
          fixSuggestion: `Replace "${attr}" with "onVuChange".`,
        });
      }

      vueNativeEventRegex.lastIndex = 0;
      while ((match = vueNativeEventRegex.exec(line)) !== null) {
        const tag = match[1];
        const attr = match[3] ?? match[2]; // handle group matching
        findings.push({
          ruleId: "use-vu-events-vue-html",
          severity: "error",
          message: `Velkin component "${tag}" uses standard event listener "${attr}". Use Velkin custom events (e.g. "@vu-change" or "onnu-change").`,
          line: idx + 1,
          snippet: line.trim(),
          fixSuggestion: `Replace "${attr}" with "@vu-change" (Vue) or "onnu-change" (HTML).`,
        });
      }
    });

    // 3. Rule: Custom Event Payload target.value Access
    // Matches handlers like onVuChange={e => e.target.value} or onVuChange={(event) => event.target.value}
    // and flags target.value usage inside Velkin event handlers
    const eventParamRegex =
      /\bonVu[a-zA-Z]+\s*=\s*{\s*\(?([a-zA-Z0-9_]+)\)?\s*=>[^}]*\b\1\.target\.value/g;
    lines.forEach((line, idx) => {
      let match;
      eventParamRegex.lastIndex = 0;
      while ((match = eventParamRegex.exec(line)) !== null) {
        const paramName = match[1];
        findings.push({
          ruleId: "use-event-detail-value",
          severity: "error",
          message: `Velkin React wrapper events are custom events. Value properties exist on "${paramName}.detail.value" instead of "${paramName}.target.value".`,
          line: idx + 1,
          snippet: line.trim(),
          fixSuggestion: `Change "${paramName}.target.value" to "String(${paramName}.detail.value)".`,
        });
      }
    });

    // 4. Rule: Missing required props on known components
    // Detect VuInput without label, VuCheckbox without label, etc.
    const REQUIRED_PROPS: Array<{ pattern: RegExp; prop: string; comp: string }> = [
      { pattern: /<VuInput\b(?![^>]*\blabel\s*=)[^>]*(\/?>|>)/g, prop: "label", comp: "VuInput" },
      {
        pattern: /<VuCheckbox\b(?![^>]*\blabel\s*=)[^>]*(\/?>|>)/g,
        prop: "label",
        comp: "VuCheckbox",
      },
      { pattern: /<VuSwitch\b(?![^>]*\blabel\s*=)[^>]*(\/?>|>)/g, prop: "label", comp: "VuSwitch" },
      { pattern: /<VuSelect\b(?![^>]*\blabel\s*=)[^>]*(\/?>|>)/g, prop: "label", comp: "VuSelect" },
    ];
    REQUIRED_PROPS.forEach(({ pattern, prop, comp }) => {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(sourceCode)) !== null) {
        // Find line number
        const lineIdx = sourceCode.slice(0, match.index).split("\n").length;
        findings.push({
          ruleId: "no-missing-required-props",
          severity: "warning",
          message: `${comp} is missing the required "${prop}" prop. Without a label, this component is inaccessible.`,
          line: lineIdx,
          snippet: match[0].slice(0, 80).trim(),
          fixSuggestion: `Add label="${prop} text" to <${comp} ... />.`,
        });
      }
    });

    // 5. Rule: Pro components used without a tier comment
    // Flag @velkin/ui-pro imports without @velkin-pro comment
    const proImportRegex = /import\s+{[^}]+}\s+from\s+['"]@velkin\/ui-pro[^'"]*['"]/g;
    const hasProComment = /\/\/\s*@velkin-pro/i.test(sourceCode);
    lines.forEach((line, idx) => {
      let match;
      proImportRegex.lastIndex = 0;
      while ((match = proImportRegex.exec(line)) !== null) {
        if (!hasProComment) {
          findings.push({
            ruleId: "no-pro-without-tier-comment",
            severity: "warning",
            message: `Pro component imported from @velkin/ui-pro without a // @velkin-pro comment. Pro components require a production license.`,
            line: idx + 1,
            snippet: line.trim(),
            fixSuggestion: `Add // @velkin-pro comment near the import to acknowledge the license requirement.`,
          });
        }
      }
    });

    // 6. Rule: Inline style overrides on Velkin components
    // Flag style={{ ... }} on Vu* components — should use CSS custom properties instead
    const inlineStyleRegex = /<(Vu[A-Z][a-zA-Z]+)\b[^>]*\bstyle\s*=\s*\{\{/g;
    lines.forEach((line, idx) => {
      let match;
      inlineStyleRegex.lastIndex = 0;
      while ((match = inlineStyleRegex.exec(line)) !== null) {
        const comp = match[1];
        findings.push({
          ruleId: "no-inline-style-override",
          severity: "warning",
          message: `Inline style used on <${comp}>. Prefer CSS custom properties (--vu-*) for theming Velkin components.`,
          line: idx + 1,
          snippet: line.trim(),
          fixSuggestion: `Replace style={{...}} with CSS custom properties: e.g. style={{ "--vu-button-radius": "4px" } as React.CSSProperties}`,
        });
      }
    });

    // 7. Rule: <form> + Velkin inputs without <VuForm>
    const hasNativeForm = /<form\b/i.test(sourceCode);
    const hasVuInputInForm = /<Vu(Input|Checkbox|Select|Switch|Radio|Combobox)\b/.test(sourceCode);
    const hasVuForm = /<VuForm\b/.test(sourceCode);
    if (hasNativeForm && hasVuInputInForm && !hasVuForm) {
      findings.push({
        ruleId: "prefer-vu-form",
        severity: "warning",
        message: `Velkin input components detected inside a native <form> without <VuForm>. VuForm provides integrated validation, error display, and accessibility.`,
        fixSuggestion: `Replace <form> with <VuForm onVuSubmit={handleSubmit}> from "@velkin/react/form".`,
      });
    }

    // 8. Rule: Experimental component usage
    // Load experimental slugs from snapshot and flag any usage in code
    {
      const allComponents = loadVelkinComponentsCached();
      const experimentalComponents = allComponents.filter((c) => c.status === "experimental");
      for (const comp of experimentalComponents) {
        // Match JSX component name (VuDataTable) or HTML tag (vu-data-table)
        const reactName =
          "Vu" +
          comp.slug
            .split("-")
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join("");
        const tagPattern = new RegExp(`<(${reactName}\\b|${comp.tag}\\b)`, "g");
        lines.forEach((line, idx) => {
          tagPattern.lastIndex = 0;
          if (tagPattern.test(line)) {
            findings.push({
              ruleId: "no-experimental-component",
              severity: "warning",
              message: `<${comp.tag}> (${comp.name}) is marked @status experimental. API may change without notice. Not safe for production.`,
              line: idx + 1,
              snippet: line.trim(),
              fixSuggestion: `Acknowledge the risk with a comment: // @experimental-ok: <${comp.tag}> intentionally used. Track https://velkinui.com/docs/components/${comp.slug} for stable release.`,
            });
          }
        });
      }
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            withVelkinMcpMeta(
              {
                file: fileCtx,
                findings,
                ok: findings.length === 0,
                summary:
                  findings.length === 0
                    ? "✅ Velkin code validation passed. No common errors detected."
                    : `⚠️ Velkin code validation completed with ${findings.length} findings.`,
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
      McpErrorCode.THEME_GUIDE_FAILED,
      err instanceof Error ? err.message : String(err),
    );
  }
}

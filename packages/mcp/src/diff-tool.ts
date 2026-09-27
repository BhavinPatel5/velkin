import { getVelkinComponentDocs } from "./docs.js";
import { withVelkinMcpMeta } from "./mcp-response-meta.js";
import { McpErrorCode, mcpToolErr } from "./mcp-tool-errors.js";

export type DiffMigrationRequest = {
  component: string;
  fromCode: string;
  toCode: string;
};

export type DiffFinding = {
  type: "breaking" | "warning" | "info";
  prop?: string;
  event?: string;
  message: string;
  suggestion?: string;
};

/** Extract JSX/TSX props from a code snippet: collects prop="value", prop={...}, prop */
function extractJsxProps(code: string): Set<string> {
  const props = new Set<string>();
  // Match: propName="..." or propName={...} or propName (boolean shorthand)
  const re = /\b([a-zA-Z][a-zA-Z0-9_-]*)(?:\s*=\s*(?:"[^"]*"|'[^']*'|\{[^}]*\})|\b(?!=))/g;
  let m;
  while ((m = re.exec(code)) !== null) {
    const name = m[1]!;
    // Filter out JSX/HTML intrinsics
    if (
      ![
        "import",
        "from",
        "const",
        "let",
        "var",
        "return",
        "export",
        "default",
        "function",
        "class",
        "type",
        "interface",
        "extends",
        "implements",
        "new",
        "if",
        "else",
        "for",
        "while",
        "true",
        "false",
        "null",
        "undefined",
      ].includes(name)
    ) {
      props.add(name);
    }
  }
  return props;
}

/** Extract event handler names like onVuChange, onVuFocus, etc. */
function extractVuEvents(code: string): Set<string> {
  const events = new Set<string>();
  const re = /\b(onVu[A-Z][a-zA-Z0-9]*)\b/g;
  let m;
  while ((m = re.exec(code)) !== null) events.add(m[1]!);
  return events;
}

/** Extract native event listeners that should be vu-* */
function extractNativeEvents(code: string): Set<string> {
  const events = new Set<string>();
  const re = /\b(onChange|onInput|onFocus|onBlur|onClick)\b/g;
  let m;
  while ((m = re.exec(code)) !== null) events.add(m[1]!);
  return events;
}

export function handleDiffComponentMigration(req: DiffMigrationRequest) {
  try {
    const doc = getVelkinComponentDocs(req.component);
    if (!doc) {
      return mcpToolErr(McpErrorCode.UNKNOWN_COMPONENT, `Unknown component "${req.component}".`, {
        component: req.component,
      });
    }

    const fromProps = extractJsxProps(req.fromCode);
    const toProps = extractJsxProps(req.toCode);
    const fromEvents = extractVuEvents(req.fromCode);
    const toEvents = extractVuEvents(req.toCode);
    const nativeEventsInTo = extractNativeEvents(req.toCode);

    const knownProps = new Set((doc.api.props ?? []).map((p) => p.name));
    const knownEvents = new Set((doc.api.events ?? []).map((e) => e.name));

    const findings: DiffFinding[] = [];

    // Props removed from fromCode that are not in toCode (possible intentional removal or forgotten)
    for (const p of fromProps) {
      if (!toProps.has(p) && knownProps.has(p)) {
        findings.push({
          type: "warning",
          prop: p,
          message: `Prop "${p}" was in the original code but is missing in the new code.`,
          suggestion: `If intentional, ignore. Otherwise add back: ${p}={...}`,
        });
      }
    }

    // Props in toCode that are NOT in the known schema — likely renamed or invalid
    for (const p of toProps) {
      if (
        !knownProps.has(p) &&
        ![
          "className",
          "style",
          "id",
          "key",
          "ref",
          "children",
          "slot",
          "aria-label",
          "aria-describedby",
          "aria-labelledby",
          "role",
          "tabIndex",
          "onVuChange",
          "onVuFocus",
          "onVuBlur",
          "onVuInput",
        ].includes(p)
      ) {
        // Check if it looks like a Velkin prop (not a generic HTML/React prop)
        const isLikelyVelkinProp =
          !p.startsWith("data-") && !p.startsWith("aria-") && p[0] === p[0]?.toLowerCase();
        if (isLikelyVelkinProp && p.length > 2) {
          // Find close match in known props
          const closeMatch = [...knownProps].find(
            (kp) =>
              kp.toLowerCase() === p.toLowerCase() ||
              kp.replace(/-/g, "").toLowerCase() === p.replace(/-/g, "").toLowerCase(),
          );
          findings.push({
            type: "breaking",
            prop: p,
            message: `Prop "${p}" is not recognized in the ${doc.name} API schema.`,
            suggestion: closeMatch
              ? `Possible rename: use "${closeMatch}" instead of "${p}".`
              : `Check get_velkin_component_docs for valid props.`,
          });
        }
      }
    }

    // Native events used where Vu-events should be
    for (const e of nativeEventsInTo) {
      const vuEquiv = e.replace(/^on/, "onVu");
      findings.push({
        type: "breaking",
        event: e,
        message: `Native React event "${e}" used on a Velkin component. Custom elements dispatch custom events.`,
        suggestion: `Replace "${e}" with "${vuEquiv}". Access value via e.detail.value.`,
      });
    }

    // Events used in fromCode but dropped in toCode
    for (const e of fromEvents) {
      if (!toEvents.has(e)) {
        findings.push({
          type: "warning",
          event: e,
          message: `Event handler "${e}" was in the original code but not in the new code.`,
          suggestion: `Verify the new code handles "${e}" if the behavior is still needed.`,
        });
      }
    }

    const breaking = findings.filter((f) => f.type === "breaking");
    const warnings = findings.filter((f) => f.type === "warning");

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            withVelkinMcpMeta(
              {
                component: doc.slug,
                tag: doc.tag,
                breakingCount: breaking.length,
                warningCount: warnings.length,
                breaking,
                warnings,
                summary:
                  breaking.length === 0 && warnings.length === 0
                    ? `✅ No migration issues detected for ${doc.name}.`
                    : `Found ${breaking.length} breaking issue(s) and ${warnings.length} warning(s).`,
                fromPropsDetected: [...fromProps].length,
                toPropsDetected: [...toProps].length,
              },
              {
                truthLayer: "snapshot",
                agentMust:
                  "Fix all breaking issues before shipping. Verify warnings are intentional.",
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
      McpErrorCode.DIFF_MIGRATION_FAILED,
      err instanceof Error ? err.message : String(err),
    );
  }
}

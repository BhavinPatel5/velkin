import { getVelkinComponentDocs } from "./docs.js";
import { withVelkinMcpMeta } from "./mcp-response-meta.js";
import { McpErrorCode, mcpToolErr } from "./mcp-tool-errors.js";

export type ValidateUsageRequest = {
  component: string;
  props: Record<string, unknown>;
};

export type PropValidationIssue = {
  prop: string;
  issue: "unknown" | "type_mismatch" | "invalid_enum";
  expected?: string;
  received?: string;
  suggestion?: string;
};

function inferExpectedType(typeStr: string): "string" | "boolean" | "number" | "enum" | "unknown" {
  const t = typeStr.toLowerCase().replace(/\s/g, "");
  if (t === "boolean" || t === "bool") return "boolean";
  if (t === "number" || t === "int" || t === "float") return "number";
  // Detect enum: 'a' | 'b' | 'c'
  if (t.includes("|") && t.includes("'")) return "enum";
  if (t === "string") return "string";
  return "unknown";
}

function extractEnumValues(typeStr: string): string[] {
  const matches = typeStr.match(/'([^']+)'/g);
  return matches ? matches.map((m) => m.replace(/'/g, "")) : [];
}

export function handleValidateComponentUsage(req: ValidateUsageRequest) {
  try {
    const doc = getVelkinComponentDocs(req.component);
    if (!doc) {
      return mcpToolErr(
        McpErrorCode.UNKNOWN_COMPONENT,
        `Unknown component "${req.component}". Use velkin_components to search.`,
        { component: req.component },
      );
    }

    const knownProps = doc.api.props ?? [];
    const knownPropMap = new Map(knownProps.map((p) => [p.name, p]));

    const issues: PropValidationIssue[] = [];
    const validProps: string[] = [];

    for (const [key, value] of Object.entries(req.props)) {
      const propDef = knownPropMap.get(key);

      if (!propDef) {
        // Check for close match
        const closeMatch = knownProps.find(
          (p) =>
            p.name.toLowerCase() === key.toLowerCase() ||
            p.name.toLowerCase().replace(/-/g, "") === key.toLowerCase().replace(/-/g, ""),
        );
        issues.push({
          prop: key,
          issue: "unknown",
          suggestion: closeMatch
            ? `Did you mean "${closeMatch.name}"?`
            : `"${key}" is not a recognized prop. Valid props: ${knownProps
                .slice(0, 5)
                .map((p) => p.name)
                .join(", ")}...`,
        });
        continue;
      }

      // Type checking
      const expectedKind = inferExpectedType(propDef.type);
      const receivedKind = typeof value;

      if (expectedKind === "boolean" && receivedKind !== "boolean") {
        issues.push({
          prop: key,
          issue: "type_mismatch",
          expected: "boolean",
          received: receivedKind,
          suggestion: `Pass "${key}" as a boolean: ${key}={${!!value}}`,
        });
      } else if (expectedKind === "number" && receivedKind !== "number") {
        issues.push({
          prop: key,
          issue: "type_mismatch",
          expected: "number",
          received: receivedKind,
          suggestion: `Pass "${key}" as a number: ${key}={${Number(value)}}`,
        });
      } else if (expectedKind === "enum" && receivedKind === "string") {
        const enumVals = extractEnumValues(propDef.type);
        if (enumVals.length && !enumVals.includes(value as string)) {
          issues.push({
            prop: key,
            issue: "invalid_enum",
            expected: enumVals.join(" | "),
            received: String(value),
            suggestion: `Valid values: ${enumVals.map((v) => `"${v}"`).join(", ")}`,
          });
        } else {
          validProps.push(key);
        }
      } else {
        validProps.push(key);
      }
    }

    const errors = issues.filter((i) => i.issue !== "unknown" || true);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            withVelkinMcpMeta(
              {
                component: doc.slug,
                tag: doc.tag,
                valid: issues.length === 0,
                validProps,
                issues,
                summary:
                  issues.length === 0
                    ? `✅ All ${validProps.length} props are valid for <${doc.tag}>.`
                    : `⚠️ ${issues.length} issue(s) found. Fix before using.`,
                knownPropCount: knownProps.length,
              },
              { truthLayer: "snapshot", agentMust: "Fix all issues before generating code." },
            ),
            null,
            2,
          ),
        },
      ],
    };
  } catch (err) {
    return mcpToolErr(
      McpErrorCode.VALIDATE_USAGE_FAILED,
      err instanceof Error ? err.message : String(err),
    );
  }
}

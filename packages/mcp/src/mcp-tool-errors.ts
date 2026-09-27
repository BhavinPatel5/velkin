export const McpErrorCode = {
  COMPONENT_DOCS_FAILED: "COMPONENT_DOCS_FAILED",
  COMPONENT_CATALOG_FAILED: "COMPONENT_CATALOG_FAILED",
  COMPONENT_SEARCH_FAILED: "COMPONENT_SEARCH_FAILED",
  COMPONENT_API_SEARCH_FAILED: "COMPONENT_API_SEARCH_FAILED",
  INSTALL_GUIDE_INVALID_FRAMEWORK: "INSTALL_GUIDE_INVALID_FRAMEWORK",
  SETUP_GUIDE_INVALID_INPUT: "SETUP_GUIDE_INVALID_INPUT",
  USAGE_SNIPPET_INVALID_FRAMEWORK: "USAGE_SNIPPET_INVALID_FRAMEWORK",
  USAGE_SNIPPET_FAILED: "USAGE_SNIPPET_FAILED",
  COMPONENT_USAGE_FAILED: "COMPONENT_USAGE_FAILED",
  UNKNOWN_COMPONENT: "UNKNOWN_COMPONENT",
  THEME_GUIDE_FAILED: "THEME_GUIDE_FAILED",
  DOCS_READ_FAILED: "DOCS_READ_FAILED",
  RECIPES_FAILED: "RECIPES_FAILED",
  RECIPES_NOT_FOUND: "RECIPES_NOT_FOUND",
  A11Y_FAILED: "A11Y_FAILED",
  CHANGELOG_FAILED: "CHANGELOG_FAILED",
  DEPENDENCY_FAILED: "DEPENDENCY_FAILED",
  DIFF_MIGRATION_FAILED: "DIFF_MIGRATION_FAILED",
  SUGGEST_FAILED: "SUGGEST_FAILED",
  VALIDATE_USAGE_FAILED: "VALIDATE_USAGE_FAILED",
} as const;

export type McpErrorCodeValue = (typeof McpErrorCode)[keyof typeof McpErrorCode];

export function mcpErrorJson(
  code: McpErrorCodeValue | string,
  error: string,
  extra?: Record<string, unknown>,
): string {
  const body: Record<string, unknown> = { code, error };
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v !== undefined) body[k] = v;
    }
  }
  return JSON.stringify(body, null, 2);
}

export function mcpToolErr(
  code: McpErrorCodeValue | string,
  error: string,
  extra?: Record<string, unknown>,
): { content: Array<{ type: "text"; text: string }>; isError: true } {
  return {
    content: [{ type: "text", text: mcpErrorJson(code, error, extra) }],
    isError: true,
  };
}

/**
 * Tools the HTTP bridge may invoke. MUST match server.registerTool names (verify-mcp-tool-parity.mjs).
 */
export const READ_ONLY_TOOL_NAMES = [
  "diff_component_migration",
  "get_a11y_guide",
  "get_changelog",
  "get_component_dependencies",
  "get_component_usage",
  "get_docs",
  "get_velkin_component_docs",
  "get_project_guide",
  "get_recipes",
  "get_theme",
  "get_theme_tokens",
  "velkin_components",
  "velkin_lint",
  "search_icons",
  "suggest_component",
  "validate_component_usage",
] as const;

export const READ_ONLY_TOOLS = new Set<string>(READ_ONLY_TOOL_NAMES);

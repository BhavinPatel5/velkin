import { getRecipe, listRecipes } from "./recipes.js";
import { McpErrorCode, mcpToolErr } from "./mcp-tool-errors.js";
import { withVelkinMcpMeta } from "./mcp-response-meta.js";

export function handleGetRecipes(req: { operation: "list" | "get"; id?: string | null }) {
  try {
    if (req.operation === "list") {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              withVelkinMcpMeta(
                { recipes: listRecipes() },
                {
                  truthLayer: "authoritative",
                  source: "packages/mcp/src/recipes.ts",
                  agentMust: "Call get with id before implementing a recipe.",
                },
              ),
              null,
              2,
            ),
          },
        ],
      };
    }

    const id = req.id?.trim();
    if (!id) return mcpToolErr(McpErrorCode.RECIPES_FAILED, "Provide id for get operation");
    const recipe = getRecipe(id);
    if (!recipe) return mcpToolErr(McpErrorCode.RECIPES_NOT_FOUND, `Unknown recipe: ${id}`, { id });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            withVelkinMcpMeta(
              { recipe },
              {
                truthLayer: "authoritative",
                agentMust: "Follow agentChecklist; call get_velkin_component_docs for each component.",
              },
            ),
            null,
            2,
          ),
        },
      ],
    };
  } catch (err) {
    return mcpToolErr(McpErrorCode.RECIPES_FAILED, err instanceof Error ? err.message : String(err));
  }
}

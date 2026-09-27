# @velkin/mcp

MCP server for [Velkin](https://velkinui.com). Provides component catalog, API documentation, framework snippets, recipes, and theme guidance for coding agents.

## Install

```bash
npm install @velkin/mcp @velkin/ui
```

## Remote (Streamable HTTP)

Production endpoint: `https://mcp.velkinui.com/mcp`

```json
{
  "mcpServers": {
    "velkin": {
      "url": "https://mcp.velkinui.com/mcp"
    }
  }
}
```

Local HTTP server:

```bash
npm run build -w @velkin/mcp
npm run start:http -w @velkin/mcp
# → http://localhost:3100/mcp
```

## Cursor / Claude Desktop

```json
{
  "mcpServers": {
    "velkin": {
      "command": "npx",
      "args": ["-y", "@velkin/mcp"]
    }
  }
}
```

Monorepo development:

```json
{
  "mcpServers": {
    "velkin": {
      "command": "node",
      "args": ["packages/mcp/dist/mcp-stdio-entry.js"],
      "cwd": "/path/to/velkin"
    }
  }
}
```

## Health check

```bash
npx velkin-mcp --health
```

## Tools

| Tool | When to use |
|------|-------------|
| `get_project_guide` | Install and bundler setup (lit, react, vue, next) |
| `velkin_components` | List, search, or API-keyword discovery |
| `get_velkin_component_docs` | Authoritative props, slots, and events |
| `get_component_usage` | Lit / React / Vue starter snippets |
| `get_recipes` | Multi-component patterns |
| `get_theme` | Theme provider, dark mode, SSR |
| `get_docs` | Shipped guides (`agent-workflow.md`, `theme-guidelines.md`, `ai-checklist.md`) |

## Recommended workflow

1. `get_docs` → `agent-workflow.md`
2. `get_velkin_component_docs` before using an unfamiliar component
3. `get_recipes` for application-level patterns
4. `get_docs` → `ai-checklist.md` before finishing

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `VELKIN_DOCS_SITE_BASE_URL` | `https://mcp.velkinui.com` | Live snippet enrichment |
| `VELKIN_DOCS_SITE_DISABLE=1` | — | Offline snapshot only |
| `VELKIN_UI_PACKAGE_ROOT` | — | Pin `@velkin/ui` path |

## CLI

```bash
npx velkin-mcp --help
npx velkin-mcp --health
npx velkin-mcp init --client cursor   # also: claude | vscode | all
```

Docs: https://velkinui.com/docs/mcp-servers

## Resources

- `velkin://catalog/components` — catalog snapshot
- `velkin://manifest/custom-elements.json` — custom elements manifest from `@velkin/ui`
- `velkin://data/docs-snapshot.json` — API tables snapshot

## Development

```bash
npm run build -w @velkin/mcp
npm run start -w @velkin/mcp
```

MIT components are documented in full. Pro components are listed and marked as Pro.

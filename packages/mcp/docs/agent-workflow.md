# Agent workflow for Velkin

Use this decision tree before writing UI code.

## 1. Discover

- **List all components:** `velkin_components` with `operation: "list"`
- **Find by name:** `velkin_components` with `operation: "search"` and `query`
- **Find by API keyword:** `velkin_components` with `operation: "search_by_api"` (for example `onVuChange`, `slot:header`)

## 2. Understand the API (authoritative)

Call `get_velkin_component_docs` with `name` or `names`. Default `enrich: true` merges live snippets from velkinui.com when online.

- **Props / events / slots:** read `api.props`, `api.events`, `api.slots`
- **Never invent** props, events, or slots that are not in `api.*`
- **Pro tier:** check `tier === "pro"` — requires `@velkin/ui-pro` and a license

## 3. Starters

| Need | Tool |
|------|------|
| Minimal import + JSX | `get_component_usage` (`framework: react\|vue\|lit`) |
| Snippet from docs | `get_velkin_component_docs` → `snippets` |
| Full app pattern | `get_recipes` (`operation: "get"`, `id`) |

Recipe ids: `app-shell`, `form-field`, `confirm-dialog`, `dashboard-shell`, `auth-form`, `drawer-nav`, `settings-tabs`, `toast-notifications`

## 4. Project setup

| Stack | Tool |
|-------|------|
| Install / bundler | `get_project_guide` (`framework: react\|vue\|lit\|next`) |
| Theme / dark mode | `get_theme` |
| Brand palette (OKLCH, AA contrast) | `get_docs` (`path: "theme-guidelines.md"`) |
| Long-form guide | `get_docs` (`path: "react-integration.md"`) |

## Remote MCP

```json
{ "mcpServers": { "velkin": { "url": "https://mcp.velkinui.com/mcp" } } }
```

## Import rules

```ts
// Subpath imports
import { VuButton } from "@velkin/react/button";
import VuButton from "@velkin/vue/button";
import "@velkin/ui/button";

// Do not use package root barrels
import { VuButton } from "@velkin/react";
```

## React event naming

Lit `vu-*` events become `onVu*` in React: `vu-change` → `onVuChange`. Detail is on `e.detail`.

## Truth layers

Responses include `_velkinMcp.truthLayer`:

- **authoritative** — shipped guides, recipes, live-enriched docs
- **snapshot** — `data/docs-snapshot.json` (available offline)
- **heuristic** — generated usage snippets; verify against the API

When live enrichment is unavailable, snapshot API tables remain authoritative.

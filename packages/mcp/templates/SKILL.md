# Skill: Build with Velkin

Use this skill whenever generating or editing UI that uses `@velkin/*` or `vu-*` tags.

## Hard rules

1. Never invent props, events, slots, or CSS tokens. Call MCP first.
2. Prefer `get_velkin_component_docs` with `compact: true`. Re-call without `compact` only if you need full descriptions or type definitions.
3. Imports are subpaths only (`@velkin/react/button`). Package root barrels are forbidden.
4. React events are `onVu*` and values live on `e.detail`.
5. Wrap the app in `VuThemeProvider` with `persist`. Next.js: `defineVelkin`, `VuThemeHead` + `htmlThemeProps`, `"use client"` on any file with `onVu*` or hooks. Vite: `import "@velkin/ui/theme-provider/default.css"` plus the init script in `index.html`. Webpack/rollup: `velkin()` from `@velkin/ui/{vite,webpack,rollup}` plus `velkinReact()` / `velkinVue()`.
6. Icons: `VuIcon` with `"ion:…"` names from `search_icons`. Do not inline SVG.
7. Pro components (`tier === "pro"`) use `@velkin/react-pro` or `@velkin/ui-pro` and a `// @velkin-pro` comment. See https://velkinui.com/license.
8. Appearance: `radius="full"` (not `pill`); `size` is `sm` | `md` | `lg`; `variant` is `solid` | `outline` | `ghost` | `text` unless docs say otherwise.

## Decision tree

1. User describes a UI need without a component name → `suggest_component`
2. Migrating between Velkin versions or component APIs → `diff_component_migration`
3. Named component → `velkin_components` then `get_component_dependencies`
4. API truth → `get_velkin_component_docs` (`compact: true`, `enrich: true`)
5. Starter → `get_component_usage` or `get_recipes`
6. Before shipping → `validate_component_usage` (pass `code`) → `velkin_lint` → `get_a11y_guide`

## Optimal full workflow

```
suggest_component
  → get_component_dependencies
  → get_velkin_component_docs (compact:true)
  → validate_component_usage
  → get_component_usage / get_recipes
  → velkin_lint
  → get_a11y_guide
```

## Checklist

- [ ] Theme provider at root
- [ ] Next.js App Router: `"use client"` on interactive Velkin files
- [ ] Subpath imports
- [ ] Props match `api.props`
- [ ] Events `onVu*` + `e.detail`
- [ ] Slots via `slot="name"`
- [ ] Child dependencies imported (for example accordion-item)
- [ ] Labels / aria-label on icon-only controls
- [ ] Pro: `// @velkin-pro` + https://velkinui.com/license

# AGENTS.md

Contract for coding agents using Velkin UI.

## Stack

- Lit custom elements (`vu-*`) with official React and Vue wrappers
- Theme via `VuThemeProvider` (`persist` in applications)
- Vite: `velkin()` from `@velkin/ui/vite` plus `velkinReact()` / `velkinVue()`. Webpack/Rollup: same factories from `/webpack` or `/rollup`
- Next.js: `defineVelkin` from `@velkin/react/next`, `import "@velkin/react/ssr/client"` in `instrumentation-client.ts`, `VuThemeHead` + `htmlThemeProps` on `<html>`. Vite: `import "@velkin/ui/theme-provider/default.css"` in the entry module.
- Next.js App Router: any file with `onVu*` handlers or React state plus Velkin must start with `"use client"`

## Imports

- Use subpath imports only: `import { VuButton } from "@velkin/react/button"`
- Do not import from `@velkin/react`, `@velkin/vue`, or `@velkin/ui` package roots
- Icons: `<VuIcon icon="ion:heart-outline" />` — Iconify `ion:` ids only; do not inline SVG
- Pro: `@velkin/react-pro/<slug>` or `@velkin/ui-pro/<slug>` plus `// @velkin-pro` — see https://velkinui.com/license

## Appearance

- Props: `variant`, `color`, `tone`, `size`, `radius`
- Capsule shape is `radius="full"` (there is no `pill` prop)
- `size` is `sm` | `md` | `lg`
- `variant` is `solid` | `outline` | `ghost` | `text` unless component docs specify otherwise

## Events

- React: Lit `vu-change` → `onVuChange`; payload is `e.detail`, never `e.target.value`
- Vue: `@vu-change` (not `@change`)
- Dialog and drawer close: `onVuClose` to set `open={false}`

## Before writing UI

1. Call `suggest_component` or `velkin_components` if the component is unknown
2. Call `get_velkin_component_docs` with `compact: true` (or `diff_component_migration` when migrating between APIs)
3. Copy `get_component_usage` or `get_recipes` — do not invent props, slots, or events
4. Run `validate_component_usage` (pass `code`) then `velkin_lint`
5. Check `get_a11y_guide` for interactive components

## Slots

- Use `slot="name"` on child elements (for example dialog `header` | `body` | `footer`)
- Compose children (`VuAccordion` + `VuAccordionItem`) — do not invent an `items` prop unless the API lists it

## Commands

- `npx velkin-mcp init` — add MCP config and this file to an existing app
- `npx create-velkin-app` — scaffold Next.js, Vite React, or Vite Vue (`--template next|vite|vue`)

## Docs

- https://velkinui.com/docs/quick-start
- https://velkinui.com/docs/components
- MCP: https://mcp.velkinui.com/mcp

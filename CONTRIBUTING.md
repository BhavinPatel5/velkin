# Contributing to Velkin UI

Thank you for contributing. This repository contains the MIT source for Velkin UI. Pro packages are maintained separately. Accepted pull requests may be incorporated into Velkin releases and [velkinui.com](https://velkinui.com).

Please follow the [Code of Conduct](.github/CODE_OF_CONDUCT.md).

Consumer contract (install, imports, theme): [velkinui.com/AGENTS.md](https://velkinui.com/AGENTS.md).

## Scope

- Prefer Lit components under `packages/ui/src/<component>/`.
- React and Vue wrappers are generated from Lit. Change them only for wrapper-specific bugs.
- Do not add Pro components or Pro engines (`date-engine`, `table-engine`).

## Setup

Requires Node.js 18 or later.

```bash
git clone https://github.com/BhavinPatel5/velkin.git
cd velkin
npm install
npm run build
npm test
```

## Pull requests

1. Fork the repository and open a pull request against `main`.
2. Keep changes within the MIT surface.
3. Add or update tests when behavior changes (including accessibility).
4. Run `npm test` and `npm run format` before pushing.
5. Do not invent props, slots, events, or CSS tokens. Match existing components and [docs](https://velkinui.com/docs/components).

## Component layout

One folder per component. Tag is `vu-<kebab>`; class is `Vu<Pascal>`.

```
packages/ui/src/foo-bar/
  foo-bar.ts          # class + JSDoc + render
  foo-bar.style.ts    # css`...`
  foo-bar.types.ts    # public unions and event-detail types
  test/foo-bar.test.ts
```

- Import with `.js` extensions (`./foo-bar.style.js`).
- Re-export public types from the component file.
- `static dependencies = { "vu-icon": VuIcon }` for child tags the component renders.
- Do not invent new global `--vu-*` tokens in a component. Use existing tokens or a component-local prefix (`--btn-*`, `--card-*`) documented with `@cssproperty`.

## Docs site (JSDoc)

Component JSDoc is extracted into [velkinui.com](https://velkinui.com/docs/components). Incomplete or invented metadata makes the site drift.

Required header above `@customElement`:

```ts
/**
 * @element vu-foo
 * @summary One sentence.
 * @status stable
 * @since 0.1.0
 * @documentation https://velkinui.com/docs/components/foo
 *
 * @slot - Default slot.
 * @csspart base - Wrapper.
 * @property {VuFooVariant} variant - Paint recipe. Default: `"solid"`.
 */
```

- One-line `/** ... */` on every `@property` and `@method` (feeds IDE tooltips and docs).
- Mark internal-only members `@internal`.
- Do not add `@example` blocks in the component file.
- `@documentation` must use `https://velkinui.com/docs/components/<slug>`.
- `@since` is `0.1.0` for this release line.

## Public API

Mirror native HTML names when they exist: `selected`, `disabled`, `open`, `readonly`, `name`, `label`, `defaultValue`. Do not invent synonyms (`chosen`, `visible`, `initialValue`).

### Appearance

Classify the component, then expose only the props that role allows. Never put `color` and `tone` on the same element for the same job. `size` scales padding, type, and hit target only — never corner radius. Capsule shape is `radius="full"` (there is no `pill` prop).

| Role | Examples | Appearance |
|------|----------|------------|
| Action / intent | button, chip, checkbox, badge | `variant` + `color` + `size` + `radius` |
| Status | alert | `variant` + `color` + `size` |
| Surface / overlay | card, dropdown panel | `variant` + `tone` + `size` + `radius` — no `color` |
| Chrome | appbar, accordion shell | `variant` + `tone` — no `color` |
| Form field chrome | input, counter | `variant` + `tone` + `size` + `radius` — no `color` |

Typical values: `color` = `default` \| `primary` \| `success` \| `warning` \| `danger`; `tone` = `subtle` \| `normal` \| `strong`; `size` = `sm` \| `md` \| `lg`; `radius` = `none` \| `sm` \| `md` \| `lg` \| `full`.

Compose instead of overloading: neutral `vu-card` + `vu-alert color="success"` inside — not `vu-card color="success"`.

### Events

Host events are lowercase with a `vu-` prefix, `bubbles: true`, `composed: true`. `detail` is a typed object (export it from `*.types.ts`). Reuse established names:

| Intent | Event |
|--------|--------|
| Value or selection changed | `vu-change` |
| Overlay / dialog starts showing or hiding | `vu-open` / `vu-close` |
| `open` property flipped (v-model) | `vu-open-change` |
| Live intermediate value | `vu-input` |
| Row / card activated | `vu-activate` |

React wrappers: `vu-change` → `onVuChange`, payload on `e.detail` (never `e.target.value`). Vue: `@vu-change`.

Do not overload `vu-change` for overlay open, or invent a synonym for an existing intent.

### Slots

- Named slots: `slot="name"` on light-DOM children (dialog `header` \| `body` \| `footer`).
- Prop-or-slot: put the string fallback **inside** the slot — `<slot name="label">${this.label}</slot>`.
- Compose children (`vu-accordion` + `vu-accordion-item`). Do not invent an `items` array unless the documented API has one.

### Attributes and child `vu-*`

- Do not pass custom `attribute: "kebab-case"` to `@property()`. Use Lit’s default lowercased name. Allowed exceptions: `attribute: false` (objects / controlled `value`) and form `defaultValue` mirroring native `value`.
- When a parent updates a child `vu-*`, assign Lit properties (`child.size = this.size`). Do not `setAttribute` for component state.

### Icons and i18n

- Icons: `vu-icon` with Iconify `ion:` ids. Do not inline SVG.
- Built-in UI copy (close, previous, live-region text) uses `msg()` with an optional prop override (`closeLabel`). User-authored `label` / slot text is never auto-translated.

## Accessibility

Target WCAG 2.2 AA. Interactive components need visible focus, a 24×24px minimum target, and APG keyboard behavior (Tab between components, arrows inside composites, Escape dismisses the top overlay). Prefer native elements over ARIA. Tests must cover the default render, public props, slots, and accessibility.

## Style

- TypeScript (strict), ESM, 2-space indent, double quotes, semicolons.
- Subpath imports only: `@velkin/react/button` — never package root barrels.
- Import types with `import type { ... }`.

## Documentation

- https://velkinui.com/docs/components
- https://velkinui.com/AGENTS.md
- MCP: https://mcp.velkinui.com/mcp

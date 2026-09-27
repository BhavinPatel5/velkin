# AI checklist before shipping Velkin UI

Use this list when generating or reviewing Velkin code.

## Setup

- [ ] App wrapped in `VuThemeProvider` (React/Vue) or theme CSS loaded (Lit)
- [ ] Next.js: `defineVelkin` + blocking theme script + `suppressHydrationWarning` on `<html>`
- [ ] Vite/webpack/rollup: `velkin()` (+ `velkinReact()` / `velkinVue()`); same factory, different import path
- [ ] Imports use subpaths (`@velkin/react/button`), not package root barrels

## Per component

- [ ] Called `get_velkin_component_docs` for every `vu-*` used
- [ ] Props match `api.props` names and types (Lit lowercases attributes)
- [ ] Events use `onVu*` in React; read `e.detail` for payloads
- [ ] Slots use `slot="name"` on child elements
- [ ] Child dependencies listed in `dependencies` are imported (for example `accordion-item` with `accordion`)

## Tier

- [ ] `tier: "free"` → `@velkin/ui` / `@velkin/react` / `@velkin/vue`
- [ ] `tier: "pro"` → `@velkin/ui-pro` + a valid production license

## Accessibility

- [ ] Interactive components have labels (`label`, `aria-label`, or visible text)
- [ ] Dialog/drawer: focus trap and `onVuClose` wired
- [ ] Icon-only buttons: `aria-label` set

## Do not

- Invent CSS custom properties outside documented `api.cssProps` / parts
- Use inline SVG — use `vu-icon` with Iconify names
- Assume prop names from another library map one-to-one to Velkin

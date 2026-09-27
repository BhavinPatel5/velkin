# AGENTS.md

Application contract (install, imports, theme, Pro): https://velkinui.com/AGENTS.md

This repository is the MIT source. Follow [CONTRIBUTING.md](./CONTRIBUTING.md) so velkinui.com stays consistent.

- Edit Lit components under `packages/ui/src/<kebab>/`.
- Do not add Pro components or engines.
- Do not invent props, slots, events, or `--vu-*` tokens.
- Subpath imports only (`@velkin/react/button`).
- Appearance: `variant` / `color` / `tone` / `size` / `radius="full"` (no `pill`). Never both `color` and `tone` on the same element.
- Events: `vu-change` for values, `vu-open` / `vu-close` for overlays; React `onVu*` + `e.detail`.

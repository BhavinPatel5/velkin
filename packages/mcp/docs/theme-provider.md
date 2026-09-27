# Theme provider

`<vu-theme-provider>` / `VuThemeProvider` supplies:

- Light, dark, or system preference (`preference`, `persist`)
- CSS variable injection (`scope`: root | host | both)
- Locale for built-in strings (`locale`)

Use `VuThemeSwitcher` for a built-in preference control.

Custom brand tokens: pass a `theme` config (`VuThemeConfig`) — seeds only; derived tokens are computed.

```ts
theme = {
  primary: "#4f46e5",
  radius: "0.75rem",
  spacing: "0.25rem",
  tint: "subtle", // "none" | "subtle" | "vivid"
  dark: { primary: "#818cf8" },
  vars: { light: { "--vu-color-separator": "#eee" } },
};
```

Solid intent foregrounds: snow on accent/danger, eclipse on success/warning, default flips by mode. Overrides in `vars` that change a fill without its `-foreground` patch the pair at runtime. Validated with `npm run check:theme`. Surfaces, borders, fields, segments, and elevation derive from the seeds plus shipped defaults.

Authoring a new palette (OKLCH, WCAG AA, hue separation): see [theme-guidelines.md](./theme-guidelines.md).

# React integration

1. Install `@velkin/ui`, `@velkin/react`, `lit`, and `@lit/react`.
2. Wrap the application with `VuThemeProvider` from `@velkin/react/theme-provider`.
3. Import components by subpath. Do not use the package root export in applications.

```tsx
import { VuThemeProvider } from "@velkin/react/theme-provider";
import { VuButton } from "@velkin/react/button";

export function App() {
  return (
    <VuThemeProvider persist>
      <VuButton variant="solid">Save</VuButton>
    </VuThemeProvider>
  );
}
```

## Bundler plugins

Same factory on every bundler — only the import path changes.

- **Vite:** `velkin()` from `@velkin/ui/vite` + `velkinReact()` from `@velkin/react/vite`
- **Webpack / Rollup:** same factories from `/webpack` or `/rollup` (client only for webpack)
- **Next.js:** `defineVelkin` from `@velkin/react/next`

## Events

Lit custom events map to React props: `vu-change` → `onVuChange`. Payloads are on `e.detail`.

# Next.js integration

Use the App Router with webpack (`next dev --webpack` / `next build --webpack`).

```ts
// next.config.ts
import { defineVelkin } from "@velkin/react/next";

export default defineVelkin({
  // your Next.js config
});
```

```ts
// instrumentation-client.ts
import "@velkin/react/ssr/client";
```

## Theme and hydration (FOUC-safe)

Use `VuThemeHead` so `--vu-*` tokens and light/dark mode are correct before hydrate.
Pass the same `theme` seeds to `<VuThemeProvider theme={…}>` when branding.

```tsx
import { VuThemeHead, htmlThemeProps } from "@velkin/react/theme-head";
import { VuThemeProvider } from "@velkin/react/theme-provider";

<html lang="en" {...htmlThemeProps} suppressHydrationWarning>
  <head>
    <VuThemeHead />
  </head>
  <body>
    <VuThemeProvider persist>{children}</VuThemeProvider>
  </body>
</html>;
```

Custom brand (same seeds in head and provider):

```tsx
const brand = { primary: "#0d9488", tint: "subtle" };

<head>
  <VuThemeHead theme={brand} />
</head>
<body>
  <VuThemeProvider persist theme={brand}>
    {children}
  </VuThemeProvider>
</body>
```

Static default tokens only (Vite / no SSR): `import "@velkin/ui/theme-provider/default.css"`.

Lower-level pieces remain on `@velkin/react/theme-init` (`VuThemeInitScript`, `themeInitScript`).

`defineVelkin` configures Lit node export conditions, the custom-element registry, React `createElement` patching, declarative shadow DOM injection, and the webpack `velkin()` / `velkinReact()` plugins. Keep `vu-*` usage in Client Components.

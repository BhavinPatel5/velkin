# Velkin installation

## MIT core

```bash
npm install @velkin/ui lit
```

Import components by subpath:

```js
import "@velkin/ui/button";
import "@velkin/ui/theme-provider";
```

## React

```bash
npm install @velkin/ui @velkin/react lit @lit/react
```

```tsx
import { VuThemeProvider } from "@velkin/react/theme-provider";
import { VuButton } from "@velkin/react/button";
```

## Vue

```bash
npm install @velkin/ui @velkin/vue lit
```

## Bundler plugins

Same factory on every bundler — only the import path changes.

```ts
import { velkin } from "@velkin/ui/vite"; // or /webpack / /rollup
import { velkinReact } from "@velkin/react/vite";
import { velkinVue } from "@velkin/vue/vite";
import { velkinPro } from "@velkin/ui-pro/vite";
```

Next.js: `defineVelkin` from `@velkin/react/next` instead of wiring webpack plugins by hand.

## Pro (commercial)

```bash
npm install @velkin/ui @velkin/ui-pro @velkin/license
```

For React wrappers, also install `@velkin/react-pro`. Production use requires a valid commercial
license. See [velkinui.com/pricing](https://velkinui.com/pricing).

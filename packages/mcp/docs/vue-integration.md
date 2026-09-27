# Vue integration

```vue
<script setup lang="ts">
import VuButton from "@velkin/vue/button";
</script>

<template>
  <VuButton variant="solid">Save</VuButton>
</template>
```

Wrap the application with `VuThemeProvider` from `@velkin/vue/theme-provider` when theme context is required.

Events use Vue `v-on` with the `vu-*` names emitted by the underlying custom elements.

## Bundler plugins

Same factory on every bundler — only the import path changes.

- **Vite:** `velkin()` from `@velkin/ui/vite` + `velkinVue()` from `@velkin/vue/vite`. Set Vue `isCustomElement: (tag) => tag.startsWith("vu-")` so raw `vu-*` tags compile as custom elements.
- **Webpack / Rollup:** same factories from `/webpack` or `/rollup`

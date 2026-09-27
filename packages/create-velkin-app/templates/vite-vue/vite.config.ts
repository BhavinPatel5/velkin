import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { velkin } from "@velkin/ui/vite";
import { velkinVue } from "@velkin/vue/vite";

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith("vu-"),
        },
      },
    }),
    velkin(),
    velkinVue(),
  ].flat(),
});

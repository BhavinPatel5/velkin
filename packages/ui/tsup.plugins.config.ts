import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["plugins/vite-plugin.ts", "plugins/webpack-plugin.ts", "plugins/rollup-plugin.ts"],
  format: ["esm"],
  outDir: "plugins",
  dts: true,
  sourcemap: false,
  platform: "node",
  target: "node18",
  splitting: false,
  tsconfig: "tsconfig.plugins.json",
  external: [
    "vite",
    "webpack",
    "rollup",
    "unplugin-vue-components/vite",
    "../auto-import.js",
    "./license-shared.js",
  ],
});

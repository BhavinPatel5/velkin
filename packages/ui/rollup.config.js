import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  input: path.join(__dirname, "src", "index.ts"),
  output: {
    dir: "dist",
    format: "esm",
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: "src",
    entryFileNames: "[name].js",
    chunkFileNames: "[name].js",
  },
  plugins: [
    json(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationMap: false,
      rootDir: "src",
      outDir: "dist",
      emitDeclarationOnly: false,
      compilerOptions: {
        noEmitOnError: false,
      },
    }),
    terser(),
  ],
  external: (id) => !id.startsWith(".") && !path.isAbsolute(id),
  onwarn(warning, warn) {
    if (warning.code === "PLUGIN_WARNING" || warning.code === "CIRCULAR_DEPENDENCY") return;
    warn(warning);
  },
};

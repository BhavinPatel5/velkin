/**
 * @see https://custom-elements-manifest.open-wc.org/analyzer/config/
 * Emits dist/custom-elements.json for tooling (IDEs, docs).
 */
export default {
  globs: ["src/*/*.ts", "src/vu-*/*.ts"],
  exclude: ["**/*.test.ts", "**/*.types.ts", "**/*.style.ts"],
  outdir: "dist",
  litelement: true,
  packagejson: false,
  dependencies: false,
};

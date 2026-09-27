/** Webpack loader: prepend side-effect imports (Lit SSR + CE registry). */
module.exports = function vuLitSsrPrependLoader(source) {
  const imports = this.getOptions()?.imports ?? [];
  const preamble = imports.map((id) => `import ${JSON.stringify(id)};\n`).join("");
  return preamble + source;
};

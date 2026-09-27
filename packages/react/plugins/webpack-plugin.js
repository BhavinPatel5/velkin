// plugins/webpack-plugin.ts
var CORE_ONLY_RE = /[\\/](@velkin[\\/]ui|node_modules[\\/]@velkin[\\/]ui|packages[\\/]core)([\\/]|$)/;
function velkinReact(options = {}) {
  const treeShake = options.treeShake !== false;
  if (!treeShake) {
    return { name: "velkin-react", apply: () => {
    } };
  }
  return {
    name: "velkin-react",
    apply(compiler) {
      if (!compiler.options.module) {
        compiler.options.module = { rules: [] };
      }
      const rules = compiler.options.module.rules ??= [];
      rules.unshift({ test: CORE_ONLY_RE, sideEffects: true });
      compiler.hooks.compilation.tap("velkin-react", (compilation) => {
        compilation.hooks.succeedModule.tap(
          "velkin-react",
          (mod) => {
            const module = mod;
            const resource = module.resource;
            if (!resource) return;
            const normalized = resource.replace(/\\/g, "/");
            if (!CORE_ONLY_RE.test(normalized)) return;
            if (module.buildMeta) module.buildMeta.sideEffectFree = false;
            if (module.buildInfo) module.buildInfo.sideEffectFree = false;
          }
        );
      });
    }
  };
}
export {
  velkinReact
};

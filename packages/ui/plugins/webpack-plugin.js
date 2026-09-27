// plugins/webpack-plugin.ts
var PACKAGE_RE = /[\\/](@velkin[\\/]ui(?:-pro)?|node_modules[\\/]@velkin[\\/]ui(?:-pro)?|packages[\\/]core(?:-pro)?)([\\/]|$)/;
function velkin(options = {}) {
  const treeShake = options.treeShake !== false;
  if (!treeShake) {
    return { name: "velkin", apply: () => {
    } };
  }
  return {
    name: "velkin",
    apply(compiler) {
      const moduleOpts = compiler.options.module;
      if (!moduleOpts) {
        compiler.options.module = { rules: [] };
      }
      const rules = compiler.options.module.rules ??= [];
      rules.unshift({ test: PACKAGE_RE, sideEffects: true });
      compiler.hooks.compilation.tap("velkin", (compilation) => {
        compilation.hooks.succeedModule.tap("velkin", (mod) => {
          const module = mod;
          const resource = module.resource;
          if (!resource) return;
          const normalized = resource.replace(/\\/g, "/");
          if (!PACKAGE_RE.test(normalized)) return;
          if (module.buildMeta) module.buildMeta.sideEffectFree = false;
          if (module.buildInfo) module.buildInfo.sideEffectFree = false;
        });
      });
    }
  };
}
export {
  velkin
};

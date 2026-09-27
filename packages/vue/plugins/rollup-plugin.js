// plugins/rollup-plugin.ts
function isCoreModule(id) {
  const n = id.replace(/\\/g, "/");
  return n.includes("@velkin/ui") || n.includes("node_modules/@velkin/ui") || n.includes("packages/core");
}
function velkinVue(options = {}) {
  const treeShake = options.treeShake !== false;
  return {
    name: "velkin-vue",
    options(inputOptions) {
      if (!treeShake) return;
      const prev = inputOptions.treeshake;
      const prevSideEffects = typeof prev === "object" && prev !== null && prev.moduleSideEffects;
      inputOptions.treeshake = {
        ...typeof prev === "object" && prev !== null ? prev : {},
        moduleSideEffects(id) {
          if (isCoreModule(id)) return true;
          if (typeof prevSideEffects === "function") return prevSideEffects(id, false);
          if (Array.isArray(prevSideEffects)) return prevSideEffects.some((s) => id.includes(s));
          return prevSideEffects !== false;
        }
      };
    },
    transform(_, id) {
      if (!treeShake) return null;
      if (isCoreModule(id)) return { moduleSideEffects: true };
      return null;
    }
  };
}
export {
  velkinVue
};

/**
 * Webpack plugin for @velkin/vue.
 */
import type { Compiler, WebpackPluginInstance } from "webpack";

const CORE_ONLY_RE =
  /[\\/](@velkin[\\/]ui|node_modules[\\/]@velkin[\\/]ui|packages[\\/]core)([\\/]|$)/;

export interface VelkinVuePluginOptions {
  treeShake?: boolean;
}

export function velkinVue(
  options: VelkinVuePluginOptions = {},
): WebpackPluginInstance {
  const treeShake = options.treeShake !== false;
  if (!treeShake) {
    return { name: "velkin-vue", apply: () => {} };
  }
  return {
    name: "velkin-vue",
    apply(compiler: Compiler) {
      if (!(compiler.options.module as { rules?: unknown[] } | undefined)) {
        (compiler.options as { module?: { rules?: unknown[] } }).module = { rules: [] };
      }
      const rules =
        (compiler.options.module as { rules?: unknown[] }).rules ??=
        [];
      rules.unshift({ test: CORE_ONLY_RE, sideEffects: true });

      compiler.hooks.compilation.tap("velkin-vue", (compilation) => {
        compilation.hooks.succeedModule.tap(
          "velkin-vue",
          (mod) => {
            const module = mod as {
              resource?: string;
              buildMeta?: { sideEffectFree?: boolean };
              buildInfo?: { sideEffectFree?: boolean };
            };
            const resource = module.resource;
            if (!resource) return;
            const normalized = resource.replace(/\\/g, "/");
            if (!CORE_ONLY_RE.test(normalized)) return;
            if (module.buildMeta) module.buildMeta.sideEffectFree = false;
            if (module.buildInfo) module.buildInfo.sideEffectFree = false;
          },
        );
      });
    },
  };
}

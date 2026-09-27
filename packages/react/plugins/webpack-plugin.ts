/**
 * Webpack plugin for @velkin/react.
 */
import type { Compiler, WebpackPluginInstance } from "webpack";

const CORE_ONLY_RE =
  /[\\/](@velkin[\\/]ui|node_modules[\\/]@velkin[\\/]ui|packages[\\/]core)([\\/]|$)/;

export interface VelkinReactPluginOptions {
  treeShake?: boolean;
}

export function velkinReact(
  options: VelkinReactPluginOptions = {},
): WebpackPluginInstance {
  const treeShake = options.treeShake !== false;
  if (!treeShake) {
    return { name: "velkin-react", apply: () => {} };
  }
  return {
    name: "velkin-react",
    apply(compiler: Compiler) {
      if (!(compiler.options.module as { rules?: unknown[] } | undefined)) {
        (compiler.options as { module?: { rules?: unknown[] } }).module = { rules: [] };
      }
      const rules =
        (compiler.options.module as { rules?: unknown[] }).rules ??=
        [];
      rules.unshift({ test: CORE_ONLY_RE, sideEffects: true });

      compiler.hooks.compilation.tap("velkin-react", (compilation) => {
        compilation.hooks.succeedModule.tap(
          "velkin-react",
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

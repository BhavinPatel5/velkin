/**
 * Webpack plugin for @velkin/ui (+ @velkin/ui-pro custom-element side effects).
 */
import type { Compiler, WebpackPluginInstance } from "webpack";

const PACKAGE_RE =
  /[\\/](@velkin[\\/]ui(?:-pro)?|node_modules[\\/]@velkin[\\/]ui(?:-pro)?|packages[\\/]core(?:-pro)?)([\\/]|$)/;

export interface VelkinPluginOptions {
  treeShake?: boolean;
}

export function velkin(
  options: VelkinPluginOptions = {},
): WebpackPluginInstance {
  const treeShake = options.treeShake !== false;
  if (!treeShake) {
    return { name: "velkin", apply: () => {} };
  }
  return {
    name: "velkin",
    apply(compiler: Compiler) {
      const moduleOpts = compiler.options.module as { rules?: unknown[] } | undefined;
      if (!moduleOpts) {
        (compiler.options as { module?: { rules?: unknown[] } }).module = { rules: [] };
      }
      const rules = ((compiler.options.module as { rules?: unknown[] }).rules ??= []);
      rules.unshift({ test: PACKAGE_RE, sideEffects: true });

      compiler.hooks.compilation.tap("velkin", (compilation) => {
        compilation.hooks.succeedModule.tap("velkin", (mod) => {
          const module = mod as {
            resource?: string;
            buildMeta?: { sideEffectFree?: boolean };
            buildInfo?: { sideEffectFree?: boolean };
          };
          const resource = module.resource;
          if (!resource) return;
          const normalized = resource.replace(/\\/g, "/");
          if (!PACKAGE_RE.test(normalized)) return;
          if (module.buildMeta) module.buildMeta.sideEffectFree = false;
          if (module.buildInfo) module.buildInfo.sideEffectFree = false;
        });
      });
    },
  };
}

/**
 * Rollup plugin for @velkin/react.
 */
import type { Plugin } from "rollup";

function isCoreModule(id: string): boolean {
  const n = id.replace(/\\/g, "/");
  return (
    n.includes("@velkin/ui") ||
    n.includes("node_modules/@velkin/ui") ||
    n.includes("packages/core")
  );
}

export interface VelkinReactPluginOptions {
  treeShake?: boolean;
}

export function velkinReact(
  options: VelkinReactPluginOptions = {},
): Plugin {
  const treeShake = options.treeShake !== false;
  return {
    name: "velkin-react",
    options(inputOptions) {
      if (!treeShake) return;
      const prev = inputOptions.treeshake;
      const prevSideEffects =
        typeof prev === "object" && prev !== null && prev.moduleSideEffects;
      inputOptions.treeshake = {
        ...(typeof prev === "object" && prev !== null ? prev : {}),
        moduleSideEffects(id: string) {
          if (isCoreModule(id)) return true;
          if (typeof prevSideEffects === "function")
            return prevSideEffects(id, false);
          if (Array.isArray(prevSideEffects))
            return prevSideEffects.some((s) => id.includes(s));
          return prevSideEffects !== false;
        },
      };
    },
    transform(_, id) {
      if (!treeShake) return null;
      if (isCoreModule(id)) return { moduleSideEffects: true };
      return null;
    },
  };
}

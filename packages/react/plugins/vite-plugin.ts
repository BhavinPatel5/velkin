/**
 * Vite plugin for @velkin/react.
 * Auto-import via optional peer `unplugin-react-components` (consumer installs).
 */
import { createRequire } from "node:module";
import type { Plugin } from "vite";
import { VelkinUIReactResolver } from "../auto-import.js";

const require = createRequire(import.meta.url);

const VELKIN_UI_PACKAGE_RE = /[/\\]packages[/\\](core|react)[/\\]/;

export interface VelkinReactPluginOptions {
  resolverOptions?: Record<string, unknown>;
  dts?: boolean;
  componentsOptions?: Record<string, unknown>;
  treeShake?: boolean;
}

function loadUnpluginReactComponents(): (options?: Record<string, unknown>) => Plugin {
  try {
    // Optional peer — not installed in this monorepo; consumers add it for auto-import.
    return require("unplugin-react-components/vite").default as (
      options?: Record<string, unknown>,
    ) => Plugin;
  } catch {
    throw new Error(
      "@velkin/react/vite auto-import needs unplugin-react-components. Install it as a dependency, or use named imports from @velkin/react/* without this plugin.",
    );
  }
}

function reactConfigPlugin(treeShake = true): Plugin {
  return {
    name: "velkin-react",
    config() {
      if (!treeShake) return {};
      return {
        optimizeDeps: { exclude: ["@velkin/ui", "@velkin/react"] },
        build: {
          rollupOptions: {
            treeshake: {
              moduleSideEffects(id: string | boolean) {
                if (typeof id !== "string") return false;
                const n = id.replace(/\\/g, "/");
                return (
                  n.includes("@velkin/ui") ||
                  n.includes("@velkin/react") ||
                  VELKIN_UI_PACKAGE_RE.test(n)
                );
              },
            },
          },
        },
      };
    },
  };
}

export function velkinReact(options: VelkinReactPluginOptions = {}): Plugin[] {
  const treeShake = options.treeShake !== false;
  const Components = loadUnpluginReactComponents();
  return [
    reactConfigPlugin(treeShake),
    Components({
      resolvers: [VelkinUIReactResolver(options.resolverOptions ?? {})] as never,
      dts: options.dts !== false,
      ...options.componentsOptions,
    }) as Plugin,
  ];
}

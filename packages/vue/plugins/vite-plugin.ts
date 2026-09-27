/**
 * Vite plugin for @velkin/vue.
 */
import Components from "unplugin-vue-components/vite";
import type { Plugin } from "vite";
import { VelkinUIVueResolver } from "../auto-import.js";

/** Treat `vu-*` tags as custom elements in Vue SFCs. */
export function isVelkinCustomElement(tag: string): boolean {
  return tag.startsWith("vu-");
}

const VELKIN_UI_PACKAGE_RE = /[/\\]packages[/\\](core|vue)[/\\]/;

export interface VelkinVuePluginOptions {
  resolverOptions?: Record<string, unknown>;
  dts?: boolean;
  componentsOptions?: Record<string, unknown>;
  treeShake?: boolean;
}

function vueConfigPlugin(treeShake = true): Plugin {
  return {
    name: "velkin-vue",
    config() {
      if (!treeShake) return {};
      return {
        optimizeDeps: { exclude: ["@velkin/ui", "@velkin/vue"] },
        build: {
          rollupOptions: {
            treeshake: {
              moduleSideEffects(id: string | boolean) {
                if (typeof id !== "string") return false;
                const n = id.replace(/\\/g, "/");
                return (
                  n.includes("@velkin/ui") ||
                  n.includes("@velkin/vue") ||
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

export function velkinVue(options: VelkinVuePluginOptions = {}): Plugin[] {
  const treeShake = options.treeShake !== false;
  return [
    vueConfigPlugin(treeShake),
    Components({
      resolvers: [VelkinUIVueResolver(options.resolverOptions ?? {})],
      dts: options.dts !== false,
      ...options.componentsOptions,
    }) as Plugin,
  ];
}

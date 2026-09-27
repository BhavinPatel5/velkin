// plugins/vite-plugin.ts
import Components from "unplugin-vue-components/vite";
import { VelkinUIVueResolver } from "../auto-import.js";
function isVelkinCustomElement(tag) {
  return tag.startsWith("vu-");
}
var VELKIN_UI_PACKAGE_RE = /[/\\]packages[/\\](core|vue)[/\\]/;
function vueConfigPlugin(treeShake = true) {
  return {
    name: "velkin-vue",
    config() {
      if (!treeShake) return {};
      return {
        optimizeDeps: { exclude: ["@velkin/ui", "@velkin/vue"] },
        build: {
          rollupOptions: {
            treeshake: {
              moduleSideEffects(id) {
                if (typeof id !== "string") return false;
                const n = id.replace(/\\/g, "/");
                return n.includes("@velkin/ui") || n.includes("@velkin/vue") || VELKIN_UI_PACKAGE_RE.test(n);
              }
            }
          }
        }
      };
    }
  };
}
function velkinVue(options = {}) {
  const treeShake = options.treeShake !== false;
  return [
    vueConfigPlugin(treeShake),
    Components({
      resolvers: [VelkinUIVueResolver(options.resolverOptions ?? {})],
      dts: options.dts !== false,
      ...options.componentsOptions
    })
  ];
}
export {
  isVelkinCustomElement,
  velkinVue
};

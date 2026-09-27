// plugins/vite-plugin.ts
import { createRequire } from "module";
import { VelkinUIReactResolver } from "../auto-import.js";
var require2 = createRequire(import.meta.url);
var VELKIN_UI_PACKAGE_RE = /[/\\]packages[/\\](core|react)[/\\]/;
function loadUnpluginReactComponents() {
  try {
    return require2("unplugin-react-components/vite").default;
  } catch {
    throw new Error(
      "@velkin/react/vite auto-import needs unplugin-react-components. Install it as a dependency, or use named imports from @velkin/react/* without this plugin."
    );
  }
}
function reactConfigPlugin(treeShake = true) {
  return {
    name: "velkin-react",
    config() {
      if (!treeShake) return {};
      return {
        optimizeDeps: { exclude: ["@velkin/ui", "@velkin/react"] },
        build: {
          rollupOptions: {
            treeshake: {
              moduleSideEffects(id) {
                if (typeof id !== "string") return false;
                const n = id.replace(/\\/g, "/");
                return n.includes("@velkin/ui") || n.includes("@velkin/react") || VELKIN_UI_PACKAGE_RE.test(n);
              }
            }
          }
        }
      };
    }
  };
}
function velkinReact(options = {}) {
  const treeShake = options.treeShake !== false;
  const Components = loadUnpluginReactComponents();
  return [
    reactConfigPlugin(treeShake),
    Components({
      resolvers: [VelkinUIReactResolver(options.resolverOptions ?? {})],
      dts: options.dts !== false,
      ...options.componentsOptions
    })
  ];
}
export {
  velkinReact
};

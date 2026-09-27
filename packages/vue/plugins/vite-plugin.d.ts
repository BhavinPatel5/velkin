import { Plugin } from 'vite';

interface VelkinVuePluginOptions {
  resolverOptions?: Record<string, unknown>;
  dts?: boolean;
  componentsOptions?: Record<string, unknown>;
  treeShake?: boolean;
}
declare function velkinVue(options?: VelkinVuePluginOptions): Plugin[];
/** Treat `vu-*` tags as custom elements in Vue SFCs. */
declare function isVelkinCustomElement(tag: string): boolean;

export { type VelkinVuePluginOptions, isVelkinCustomElement, velkinVue };

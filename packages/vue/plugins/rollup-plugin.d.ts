import { Plugin } from 'rollup';

/**
 * Rollup plugin for @velkin/vue.
 */

interface VelkinVuePluginOptions {
  treeShake?: boolean;
}
declare function velkinVue(options?: VelkinVuePluginOptions): Plugin;

export { type VelkinVuePluginOptions, velkinVue };

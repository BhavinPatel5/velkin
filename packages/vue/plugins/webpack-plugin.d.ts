import { WebpackPluginInstance } from 'webpack';

/**
 * Webpack plugin for @velkin/vue.
 */

interface VelkinVuePluginOptions {
  treeShake?: boolean;
}
declare function velkinVue(
  options?: VelkinVuePluginOptions,
): WebpackPluginInstance;

export { type VelkinVuePluginOptions, velkinVue };

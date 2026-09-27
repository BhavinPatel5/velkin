import { WebpackPluginInstance } from 'webpack';

/**
 * Webpack plugin for @velkin/react.
 */

interface VelkinReactPluginOptions {
  treeShake?: boolean;
}
declare function velkinReact(
  options?: VelkinReactPluginOptions,
): WebpackPluginInstance;

export { type VelkinReactPluginOptions, velkinReact };

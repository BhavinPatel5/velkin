import { WebpackPluginInstance } from 'webpack';

/**
 * Webpack plugin for @velkin/ui.
 */

interface VelkinPluginOptions {
  treeShake?: boolean;
}
declare function velkin(
  options?: VelkinPluginOptions,
): WebpackPluginInstance;

export { type VelkinPluginOptions, velkin };

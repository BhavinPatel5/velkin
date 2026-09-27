import { Plugin } from 'rollup';

/**
 * Rollup plugin for @velkin/react.
 */

interface VelkinReactPluginOptions {
  treeShake?: boolean;
}
declare function velkinReact(options?: VelkinReactPluginOptions): Plugin;

export { type VelkinReactPluginOptions, velkinReact };

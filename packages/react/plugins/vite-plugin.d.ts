import { Plugin } from 'vite';

interface VelkinReactPluginOptions {
  resolverOptions?: Record<string, unknown>;
  dts?: boolean;
  componentsOptions?: Record<string, unknown>;
  treeShake?: boolean;
}
declare function velkinReact(options?: VelkinReactPluginOptions): Plugin[];

export { type VelkinReactPluginOptions, velkinReact };

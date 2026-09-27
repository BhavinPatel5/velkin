import { Plugin } from 'rollup';

interface VelkinRollupSideEffectsOptions {
  treeShake?: boolean;
}
interface VelkinAutoImportOptions {
  packageName?: string;
  entryHtml?: string;
  entryPath?: string | null;
}
interface VelkinPluginOptions extends VelkinRollupSideEffectsOptions {
  mode?: "default" | "auto-import";
  packageName?: string;
  entryHtml?: string;
  entryPath?: string | null;
}
declare function velkin(options?: VelkinPluginOptions): Plugin | Plugin[];

export { type VelkinAutoImportOptions, type VelkinPluginOptions, type VelkinRollupSideEffectsOptions, velkin };

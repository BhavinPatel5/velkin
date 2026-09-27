import { Plugin } from 'vite';

interface VelkinAutoImportOptions {
  packageName?: string;
  entryHtml?: string;
  entryScript?: string | null;
  treeShake?: boolean;
}
interface VelkinComponentsOptions {
  resolverOptions?: Record<string, unknown>;
  dts?: boolean;
  componentsOptions?: Record<string, unknown>;
}
interface VelkinPluginOptions extends VelkinAutoImportOptions {
  mode?: "vue" | "auto-import";
  resolverOptions?: Record<string, unknown>;
  dts?: boolean;
  componentsOptions?: Record<string, unknown>;
}
declare function velkin(options?: VelkinPluginOptions): Plugin | Plugin[];

export { type VelkinAutoImportOptions, type VelkinComponentsOptions, type VelkinPluginOptions, velkin };

import type { NextConfig } from "next";

export type VelkinConfigOptions = {
  /** App root used to resolve `node_modules` (default: `process.cwd()`). */
  root?: string;
  /** Override or disable the Node-safe `lit-localize-runtime` alias. */
  litLocalizeRuntime?: string | false;
  /** Skip `velkin` / `velkinReact` on the client bundle. */
  autoImport?: boolean;
};

/** Wrap `next.config` so Lit DSD SSR + hydrate work with almost no app boilerplate. */
export function defineVelkin(nextConfig?: NextConfig, options?: VelkinConfigOptions): NextConfig;

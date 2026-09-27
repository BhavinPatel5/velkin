import { isServer } from "lit";

export { isServer };

/**
 * Client path for Lit SSR + Vitest.
 * Requires Lit `!isServer` and a `window` — so jsdom unit tests (browser Lit export)
 * run client code, while Node SSR with the DOM shim still skips it.
 */
export function isClient(): boolean {
  return !isServer && typeof globalThis.window !== "undefined";
}

/** True when `document` is usable (client + not missing shim). */
export function canUseDocument(): boolean {
  return isClient() && typeof globalThis.document !== "undefined";
}

/** True when `ResizeObserver` exists on the client. */
export function canUseResizeObserver(): boolean {
  return isClient() && typeof globalThis.ResizeObserver !== "undefined";
}

/** True when `requestAnimationFrame` exists on the client. */
export function canUseRaf(): boolean {
  return isClient() && typeof globalThis.requestAnimationFrame === "function";
}

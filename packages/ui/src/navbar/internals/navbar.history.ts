import { isClient } from "../../internals/utils/env.js";

let _historyPatched = false;

/** Patch pushState/replaceState once so SPA routers can notify navbars. */
export function ensureNavbarHistoryPatch(): void {
  if (!isClient() || _historyPatched) return;
  const notify = () => window.dispatchEvent(new Event("location-changed"));
  const push = history.pushState.bind(history);
  const replace = history.replaceState.bind(history);
  history.pushState = (...args: Parameters<History["pushState"]>) => {
    const result = push(...args);
    notify();
    return result;
  };
  history.replaceState = (...args: Parameters<History["replaceState"]>) => {
    const result = replace(...args);
    notify();
    return result;
  };
  _historyPatched = true;
}

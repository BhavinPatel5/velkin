import {
  CustomElementRegistry,
  Element as ShimElement,
  HTMLElement as ShimHTMLElement,
} from "@lit-labs/ssr-dom-shim";
import { installDefineGuard } from "./define-guard.js";

const SSR_STYLE = Symbol.for("nu.ssrStyle");

function createSsrStyle() {
  const map = new Map();
  return {
    setProperty(name, value) {
      if (value) map.set(name, value);
      else map.delete(name);
    },
    removeProperty(name) {
      const prev = map.get(name) ?? "";
      map.delete(name);
      return prev;
    },
    getPropertyValue(name) {
      return map.get(name) ?? "";
    },
  };
}

/** Lit `willUpdate` writes host CSS vars; the CE-only HTMLElement shim has no `style`. */
function installHostStyle(ctor) {
  if (!ctor?.prototype) return;
  const proto = ctor.prototype;
  if (Object.getOwnPropertyDescriptor(proto, "style")?.get) return;
  Object.defineProperty(proto, "style", {
    configurable: true,
    enumerable: true,
    get() {
      if (!this[SSR_STYLE]) this[SSR_STYLE] = createSsrStyle();
      return this[SSR_STYLE];
    },
  });
}

/**
 * CE registry only — do not install `window`/`document`.
 * The full `@lit-labs/ssr` window shim makes React 19 SSR call `setAttribute` on non-DOM hosts.
 */
if (typeof globalThis.customElements === "undefined") {
  globalThis.Element ??= ShimElement;
  globalThis.HTMLElement ??= ShimHTMLElement;
  globalThis.customElements = new CustomElementRegistry();
}

installHostStyle(ShimHTMLElement);
installHostStyle(globalThis.HTMLElement);
installDefineGuard();

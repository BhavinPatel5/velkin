/** Ignore duplicate `customElements.define` (HMR / multi-bundle). */
export function installDefineGuard() {
  if (typeof globalThis === "undefined" || !globalThis.customElements?.define) return;
  if (globalThis.customElements.define.__vuGuarded) return;
  const orig = globalThis.customElements.define.bind(globalThis.customElements);
  function safeDefine(name, ctor, options) {
    if (globalThis.customElements.get(name)) return;
    try {
      orig(name, ctor, options);
    } catch (err) {
      if (!(err instanceof Error && err.message.includes("already been used"))) throw err;
    }
  }
  safeDefine.__vuGuarded = true;
  globalThis.customElements.define = safeDefine;
}

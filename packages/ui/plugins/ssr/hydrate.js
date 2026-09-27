import { hydrateShadowRoots } from "@webcomponents/template-shadowroot/template-shadowroot.js";
import { installDefineGuard } from "./define-guard.js";

installDefineGuard();

/** Client-only: attach declarative shadow roots in browsers without native DSD. */
if (
  typeof document !== "undefined" &&
  typeof HTMLTemplateElement !== "undefined" &&
  !Object.prototype.hasOwnProperty.call(HTMLTemplateElement.prototype, "shadowRootMode")
) {
  hydrateShadowRoots(document.body);
}

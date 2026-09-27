import { isClient } from "../../internals/utils/env.js";
import type { VuNavbarMenuTrigger } from "../navbar.types.js";

/** Resolves `auto` to hover on fine pointers and click on touch/coarse devices. */
export function resolveNavbarMenuTrigger(trigger: VuNavbarMenuTrigger): "hover" | "click" {
  if (trigger !== "auto") return trigger;
  if (!isClient()) return "click";
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches ? "hover" : "click";
}

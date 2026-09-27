/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { isServer } from "lit";
import { canUseDocument, canUseRaf, canUseResizeObserver, isClient } from "./env.js";

describe("env", () => {
  it("resolves Lit browser build under Vitest jsdom (isServer false)", () => {
    expect(isServer).toBe(false);
    expect(isClient()).toBe(true);
  });

  it("exposes common client APIs via helpers", () => {
    expect(canUseDocument()).toBe(true);
    expect(canUseRaf()).toBe(true);
    expect(canUseResizeObserver()).toBe(typeof ResizeObserver !== "undefined");
  });
});

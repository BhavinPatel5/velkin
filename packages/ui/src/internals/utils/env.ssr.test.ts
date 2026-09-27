/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { isServer } from "lit";
import { canUseDocument, canUseRaf, isClient } from "./env.js";

describe("env (node SSR)", () => {
  it("resolves Lit node build (isServer true) and skips client APIs", () => {
    expect(isServer).toBe(true);
    expect(isClient()).toBe(false);
    expect(canUseDocument()).toBe(false);
    expect(canUseRaf()).toBe(false);
  });
});

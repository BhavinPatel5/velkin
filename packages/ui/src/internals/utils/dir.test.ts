/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { resolveIsRtl } from "./dir.js";

describe("resolveIsRtl", () => {
  it("honors an explicit override", () => {
    expect(resolveIsRtl(document.createElement("div"), true)).toBe(true);
    expect(resolveIsRtl(document.createElement("div"), false)).toBe(false);
  });

  it("reads computed direction", () => {
    const el = document.createElement("div");
    el.style.direction = "rtl";
    document.body.append(el);
    expect(resolveIsRtl(el)).toBe(true);
    el.remove();
  });
});

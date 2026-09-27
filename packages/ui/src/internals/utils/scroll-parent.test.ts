import { expect } from "vitest";
import { getNearestScrollParent } from "./scroll-parent.js";

describe("getNearestScrollParent", () => {
  it("returns null when only the viewport scrolls", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    expect(getNearestScrollParent(el)).toBeNull();
    el.remove();
  });

  it("returns the nearest overflow:auto ancestor", () => {
    const outer = document.createElement("div");
    outer.style.overflow = "auto";
    outer.style.height = "100px";
    const mid = document.createElement("div");
    const inner = document.createElement("div");
    mid.appendChild(inner);
    outer.appendChild(mid);
    document.body.appendChild(outer);
    expect(getNearestScrollParent(inner)).toBe(outer);
    outer.remove();
  });

  it("skips overflow:hidden ancestors", () => {
    const clipped = document.createElement("div");
    clipped.style.overflow = "hidden";
    const child = document.createElement("div");
    clipped.appendChild(child);
    document.body.appendChild(clipped);
    expect(getNearestScrollParent(child)).toBeNull();
    clipped.remove();
  });
});

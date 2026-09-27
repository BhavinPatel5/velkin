import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applyFlipTransition, captureFlipRects } from "./flip-transition.js";

describe("flip-transition", () => {
  let root: HTMLDivElement;

  beforeEach(() => {
    root = document.createElement("div");
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
  });

  it("captures and applies horizontal FLIP for keyed elements", () => {
    const a = document.createElement("div");
    a.dataset.flipKey = "a";
    a.style.width = "40px";
    a.style.height = "20px";
    a.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        width: 40,
        height: 20,
        right: 40,
        bottom: 20,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    const b = document.createElement("div");
    b.dataset.flipKey = "b";
    b.style.width = "40px";
    b.style.height = "20px";
    b.getBoundingClientRect = () =>
      ({
        left: 80,
        top: 0,
        width: 40,
        height: 20,
        right: 120,
        bottom: 20,
        x: 80,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    root.append(a, b);

    const before = captureFlipRects(root, "[data-flip-key]", (el) =>
      el.getAttribute("data-flip-key"),
    );

    root.innerHTML = "";
    const a2 = document.createElement("div");
    a2.dataset.flipKey = "a";
    const b2 = document.createElement("div");
    b2.dataset.flipKey = "b";
    a2.getBoundingClientRect = () =>
      ({
        left: 80,
        top: 0,
        width: 40,
        height: 20,
        right: 120,
        bottom: 20,
        x: 80,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
    b2.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        width: 40,
        height: 20,
        right: 40,
        bottom: 20,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
    root.append(a2, b2);

    applyFlipTransition(root, "[data-flip-key]", (el) => el.getAttribute("data-flip-key"), before, {
      durationMs: 0,
    });

    expect(before.has("a")).toBe(true);
    expect(before.has("b")).toBe(true);
  });
});

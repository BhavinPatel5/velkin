import { describe, expect, it } from "vitest";
import { tabArrowKeys } from "../../internals/tab-keyboard.js";

describe("tab keyboard helpers", () => {
  it("tabArrowKeys mirrors horizontal arrows in RTL", () => {
    const host = document.createElement("div");
    host.setAttribute("dir", "rtl");
    document.body.appendChild(host);
    const el = document.createElement("vu-tab");
    host.appendChild(el);
    expect(tabArrowKeys(el, "horizontal")).toEqual({
      forward: "ArrowLeft",
      backward: "ArrowRight",
    });
    host.remove();
  });

  it("tabArrowKeys keeps LTR mapping by default", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    expect(tabArrowKeys(host, "horizontal")).toEqual({
      forward: "ArrowRight",
      backward: "ArrowLeft",
    });
    host.remove();
  });

  it("tabArrowKeys uses vertical axis when orientation is vertical", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    expect(tabArrowKeys(host, "vertical")).toEqual({
      forward: "ArrowDown",
      backward: "ArrowUp",
    });
    host.remove();
  });
});

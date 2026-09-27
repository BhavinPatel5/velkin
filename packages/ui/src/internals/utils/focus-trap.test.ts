import { describe, expect, it } from "vitest";
import { activateFocusTrap, collectFocusableIn } from "./focus-trap.js";

describe("focus-trap", () => {
  it("cycles Tab focus within the root", () => {
    const root = document.createElement("div");
    const first = document.createElement("button");
    first.textContent = "First";
    const last = document.createElement("button");
    last.textContent = "Last";
    root.append(first, last);
    document.body.append(root);

    const trap = activateFocusTrap(root);
    expect(document.activeElement).toBe(first);

    last.focus();
    const tab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true });
    root.dispatchEvent(tab);
    expect(document.activeElement).toBe(first);

    trap.deactivate();
    root.remove();
  });

  it("restores returnFocus on deactivate", () => {
    const outside = document.createElement("button");
    outside.textContent = "Outside";
    const root = document.createElement("div");
    const inner = document.createElement("button");
    inner.textContent = "Inner";
    root.append(inner);
    document.body.append(outside, root);

    outside.focus();
    const trap = activateFocusTrap(root, { returnFocus: outside });
    expect(document.activeElement).toBe(inner);
    trap.deactivate();
    expect(document.activeElement).toBe(outside);

    root.remove();
    outside.remove();
  });

  it("does not initially focus a close button when other controls exist", () => {
    const root = document.createElement("div");
    const save = document.createElement("button");
    save.textContent = "Save";
    const close = document.createElement("button");
    close.className = "close-button";
    close.textContent = "Close";
    root.append(save, close);
    document.body.append(root);

    const trap = activateFocusTrap(root);
    expect(document.activeElement).toBe(save);
    trap.deactivate();
    root.remove();
  });

  it("focuses the root when the only control is a close button", () => {
    const root = document.createElement("div");
    root.tabIndex = -1;
    const close = document.createElement("button");
    close.className = "close-button";
    close.setAttribute("part", "close-button");
    close.textContent = "Close";
    root.append(close);
    document.body.append(root);

    const trap = activateFocusTrap(root);
    expect(document.activeElement).toBe(root);
    trap.deactivate();
    root.remove();
  });

  it("honors autofocus over document order", () => {
    const root = document.createElement("div");
    const first = document.createElement("button");
    first.textContent = "First";
    const preferred = document.createElement("input");
    preferred.setAttribute("autofocus", "");
    root.append(first, preferred);
    document.body.append(root);

    const trap = activateFocusTrap(root);
    expect(document.activeElement).toBe(preferred);
    trap.deactivate();
    root.remove();
  });

  it("collects slotted focusables in composed order before a close button", () => {
    const host = document.createElement("div");
    const shadow = host.attachShadow({ mode: "open" });
    const slot = document.createElement("slot");
    const close = document.createElement("button");
    close.className = "close-button";
    close.textContent = "Close";
    shadow.append(slot, close);
    const save = document.createElement("button");
    save.textContent = "Save";
    host.append(save);
    document.body.append(host);

    expect(collectFocusableIn(host).map((el) => el.textContent)).toEqual(["Save", "Close"]);
    const trap = activateFocusTrap(host);
    expect(document.activeElement).toBe(save);
    trap.deactivate();
    host.remove();
  });
});

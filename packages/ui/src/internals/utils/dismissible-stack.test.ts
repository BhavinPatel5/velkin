import { describe, expect, it, beforeEach } from "vitest";
import {
  isTopDismissible,
  registerDismissible,
  resetDismissibleStackForTests,
  unregisterDismissible,
} from "./dismissible-stack.js";

describe("dismissible-stack", () => {
  beforeEach(() => {
    resetDismissibleStackForTests();
  });

  it("isTopDismissible returns true only for the last registered host", () => {
    const a = document.createElement("div");
    const b = document.createElement("div");
    registerDismissible({ host: a, onDismiss: () => {} });
    registerDismissible({ host: b, onDismiss: () => {} });
    expect(isTopDismissible(a)).toBe(false);
    expect(isTopDismissible(b)).toBe(true);
  });

  it("Escape calls onDismiss for the topmost entry when canDismiss allows", () => {
    const top = document.createElement("div");
    let dismissed = false;
    registerDismissible({
      host: top,
      onDismiss: () => {
        dismissed = true;
      },
      canDismiss: () => true,
    });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(dismissed).toBe(true);
  });

  it("Escape is ignored when canDismiss returns false", () => {
    const top = document.createElement("div");
    let dismissed = false;
    registerDismissible({
      host: top,
      onDismiss: () => {
        dismissed = true;
      },
      canDismiss: () => false,
    });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(dismissed).toBe(false);
  });

  it("unregisterDismissible removes the host from the stack", () => {
    const host = document.createElement("div");
    registerDismissible({ host, onDismiss: () => {} });
    unregisterDismissible(host);
    expect(isTopDismissible(host)).toBe(false);
  });
});

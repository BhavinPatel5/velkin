import { afterEach, describe, expect, it, vi } from "vitest";
import {
  lockDialogScroll,
  unlockDialogScroll,
} from "./dialog-scroll-lock.js";

describe("dialog-scroll-lock", () => {
  afterEach(() => {
    while (document.documentElement.hasAttribute("data-vu-dialog-open")) {
      unlockDialogScroll();
    }
    document.body.removeAttribute("style");
    document.documentElement.style.paddingInlineEnd = "";
  });

  it("does not jump the page to top while locked", () => {
    let scrollY = 420;
    vi.spyOn(window, "scrollY", "get").mockImplementation(() => scrollY);
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation((...args: unknown[]) => {
      if (typeof args[0] === "number") {
        scrollY = args[1] as number;
        return;
      }
      const opts = args[0] as ScrollToOptions;
      if (typeof opts?.top === "number") scrollY = opts.top;
    });

    lockDialogScroll();

    expect(document.documentElement.getAttribute("data-vu-dialog-open")).toBe("true");
    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.top).toBe("-420px");
    expect(scrollTo).not.toHaveBeenCalledWith(0, 0);

    unlockDialogScroll();

    expect(document.documentElement.hasAttribute("data-vu-dialog-open")).toBe(false);
    expect(document.body.style.position).toBe("");
    expect(scrollTo).toHaveBeenCalledWith(0, 420);
  });

  it("keeps lock until the last nested overlay unlocks", () => {
    lockDialogScroll();
    lockDialogScroll();
    unlockDialogScroll();
    expect(document.documentElement.getAttribute("data-vu-dialog-open")).toBe("true");
    unlockDialogScroll();
    expect(document.documentElement.hasAttribute("data-vu-dialog-open")).toBe(false);
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  devTag,
  devWarn,
  devWarnInvalidPropValue,
  devWarnOnce,
  devWarnOnceForHost,
  resetDevWarningsForTests,
} from "./dev-warn.js";

describe("dev-warn", () => {
  afterEach(() => {
    resetDevWarningsForTests();
    vi.restoreAllMocks();
  });

  it("formats devTag from a custom element", () => {
    const el = document.createElement("vu-chip");
    expect(devTag(el)).toBe("<vu-chip>");
  });

  it("devWarnOnce dedupes by key", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    devWarnOnce("k1", "vu-alert", "first");
    devWarnOnce("k1", "vu-alert", "second");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("<vu-alert> first");
  });

  it("devWarnOnceForHost dedupes per host instance", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const a = document.createElement("vu-dialog");
    const b = document.createElement("vu-dialog");
    devWarnOnceForHost(a, "missing-accessible-name", "a");
    devWarnOnceForHost(a, "missing-accessible-name", "a again");
    devWarnOnceForHost(b, "missing-accessible-name", "b");
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("devWarnInvalidPropValue skips empty and fallback values", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const host = document.createElement("vu-dialog");
    devWarnInvalidPropValue(host, "tone", "", ["normal"], "normal");
    devWarnInvalidPropValue(host, "tone", "normal", ["normal"], "normal");
    expect(spy).not.toHaveBeenCalled();
    devWarnInvalidPropValue(host, "tone", "loud", ["normal"], "normal");
    expect(spy).toHaveBeenCalledOnce();
  });

  it("devWarn logs with tag prefix", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    devWarn("<vu-carousel>", "missing label");
    expect(spy).toHaveBeenCalledWith("<vu-carousel> missing label");
  });
});

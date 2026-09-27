import { describe, expect, it } from "vitest";
import { isElementFullscreen } from "../../internals/video-fullscreen.js";

describe("video-fullscreen", () => {
  it("matches the host or shadow descendants", () => {
    const host = document.createElement("div");
    const inner = document.createElement("div");
    host.attachShadow({ mode: "open" }).append(inner);

    expect(isElementFullscreen(host, host)).toBe(true);
    expect(isElementFullscreen(host, inner)).toBe(true);
    expect(isElementFullscreen(host, document.body)).toBe(false);
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { detectVideoVolumeSupport } from "../../internals/video-volume-support.js";

describe("detectVideoVolumeSupport", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true when volumechange fires", async () => {
    const mediaEl = document.createElement("video");
    Object.defineProperty(mediaEl, "volume", {
      configurable: true,
      writable: true,
      value: 1,
    });

    const detect = detectVideoVolumeSupport(mediaEl);
    mediaEl.dispatchEvent(new Event("volumechange"));
    await expect(detect).resolves.toBe(true);
  });

  it("returns false when volume reverts immediately", async () => {
    vi.useFakeTimers();
    const mediaEl = document.createElement("video");
    let volume = 1;
    Object.defineProperty(mediaEl, "volume", {
      configurable: true,
      get: () => volume,
      set: (next: number) => {
        volume = next;
        queueMicrotask(() => {
          volume = 1;
        });
      },
    });

    const detect = detectVideoVolumeSupport(mediaEl);
    await vi.runAllTimersAsync();
    await expect(detect).resolves.toBe(false);
    expect(volume).toBe(1);
  });

  it("returns true when volume stays changed", async () => {
    vi.useFakeTimers();
    const mediaEl = document.createElement("video");
    let volume = 1;
    Object.defineProperty(mediaEl, "volume", {
      configurable: true,
      get: () => volume,
      set: (next: number) => {
        volume = next;
      },
    });

    const detect = detectVideoVolumeSupport(mediaEl);
    await vi.runAllTimersAsync();
    await expect(detect).resolves.toBe(true);
    expect(volume).toBe(1);
  });
});

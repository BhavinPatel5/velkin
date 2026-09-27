/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3 N/A 4✓ 5✓ 6 N/A 7✓ 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect, vi } from "vitest";
import { dispatchKey } from "../../../internals/test/keyboard-test-helpers.js";
import { VuVideo } from "../video.js";
import * as volumeSupport from "../internals/video-volume-support.js";
import "../../icon/icon.js";

const sampleSrc =
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4";

describe("vu-video", () => {
  it("is defined", () => {
    expect(customElements.get("vu-video")).toBe(VuVideo);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuVideo>(html`<vu-video></vu-video>`);
    await elementUpdated(el);
    expect(el.src).toBe("");
    expect(el.poster).toBe("");
    expect(el.fit).toBe("cover");
    expect(el.preload).toBe("metadata");
    expect(el.autoplay).toBe(false);
    expect(el.loop).toBe(false);
    expect(el.muted).toBe(false);
    expect(el.playsinline).toBe(true);
    expect(el.controls).toBe(true);
    expect(el.shadowRoot?.querySelector('[part="video"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="controls"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="volume-shell"]')).toBeTruthy();
  });

  it("opens the vertical volume popover when the volume button is clicked", async () => {
    vi.spyOn(volumeSupport, "detectVideoVolumeSupport").mockResolvedValue(true);
    const el = await fixture<VuVideo>(
      html`<vu-video src=${sampleSrc} label="Demo clip"></vu-video>`,
    );
    await elementUpdated(el);

    const video = el.shadowRoot?.querySelector('[part="video"]') as HTMLVideoElement;
    video.dispatchEvent(new Event("loadedmetadata"));
    await elementUpdated(el);

    const button = el.shadowRoot?.querySelector('[part="mute"]') as HTMLButtonElement;
    button?.click();
    await elementUpdated(el);

    expect(el.shadowRoot?.querySelector('[part="volume-popover"][data-open]')).toBeTruthy();
    expect(button?.getAttribute("aria-expanded")).toBe("true");
  });

  it("toggles mute when programmatic volume is unavailable", async () => {
    vi.spyOn(volumeSupport, "detectVideoVolumeSupport").mockResolvedValue(false);
    const el = await fixture<VuVideo>(
      html`<vu-video src=${sampleSrc} label="Demo clip"></vu-video>`,
    );
    await elementUpdated(el);

    const video = el.shadowRoot?.querySelector('[part="video"]') as HTMLVideoElement;
    video.dispatchEvent(new Event("loadedmetadata"));
    await elementUpdated(el);

    expect(el.hasAttribute("volumeunavailable")).toBe(true);
    expect(el.shadowRoot?.querySelector('[part="volume-popover"]')).toBeNull();

    const button = el.shadowRoot?.querySelector('[part="mute"]') as HTMLButtonElement;
    expect(button?.hasAttribute("aria-haspopup")).toBe(false);
    button?.click();
    await elementUpdated(el);

    expect(el.muted).toBe(true);
    expect(video.muted).toBe(true);
    expect(button?.getAttribute("aria-pressed")).toBe("true");
  });

  it("reflects fit and controls attributes", async () => {
    const el = await fixture<VuVideo>(html`<vu-video fit="contain" controls></vu-video>`);
    await elementUpdated(el);
    expect(el.getAttribute("fit")).toBe("contain");
    expect(el.hasAttribute("controls")).toBe(true);
  });

  it("forwards src to the inner video", async () => {
    const el = await fixture<VuVideo>(
      html`<vu-video src=${sampleSrc} label="Demo clip"></vu-video>`,
    );
    await elementUpdated(el);
    const video = el.shadowRoot?.querySelector('[part="video"]') as HTMLVideoElement | null;
    expect(video?.getAttribute("src")).toBe(sampleSrc);
    expect(video?.getAttribute("aria-label")).toBe("Demo clip");
  });

  it("togglePlay pauses and plays via the video element", async () => {
    const el = await fixture<VuVideo>(
      html`<vu-video src=${sampleSrc} label="Demo clip"></vu-video>`,
    );
    await elementUpdated(el);
    const video = el.shadowRoot?.querySelector('[part="video"]') as HTMLVideoElement;
    let playing = false;
    video.play = () => {
      playing = true;
      video.dispatchEvent(new Event("play"));
      return Promise.resolve();
    };
    video.pause = () => {
      playing = false;
      video.dispatchEvent(new Event("pause"));
    };

    await el.play();
    expect(playing).toBe(true);
    el.pause();
    expect(playing).toBe(false);
    await el.play();
    el.togglePlay();
    expect(playing).toBe(false);
  });

  describe("keyboard", () => {
    it("Space toggles play when focus is on the shell", async () => {
      const el = await fixture<VuVideo>(
        html`<vu-video src=${sampleSrc} label="Demo clip"></vu-video>`,
      );
      await elementUpdated(el);
      const video = el.shadowRoot?.querySelector('[part="video"]') as HTMLVideoElement;
      let playing = false;
      video.play = () => {
        playing = true;
        return Promise.resolve();
      };
      video.pause = () => {
        playing = false;
      };
      const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
      base?.focus();
      base?.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
      await elementUpdated(el);
      expect(playing).toBe(true);
    });

    it("ArrowLeft and ArrowRight seek by five seconds", async () => {
      const el = await fixture<VuVideo>(
        html`<vu-video src=${sampleSrc} label="Demo clip"></vu-video>`,
      );
      await elementUpdated(el);
      const video = el.shadowRoot?.querySelector('[part="video"]') as HTMLVideoElement;
      Object.defineProperty(video, "duration", { value: 60, configurable: true });
      video.currentTime = 10;
      video.dispatchEvent(new Event("loadedmetadata"));
      await elementUpdated(el);
      const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
      base?.focus();
      base?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      expect(video.currentTime).toBe(15);
      base?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
      expect(video.currentTime).toBe(10);
    });

    it("Escape closes the volume popover", async () => {
      vi.spyOn(volumeSupport, "detectVideoVolumeSupport").mockResolvedValue(true);
      const el = await fixture<VuVideo>(
        html`<vu-video src=${sampleSrc} label="Demo clip"></vu-video>`,
      );
      await elementUpdated(el);
      const video = el.shadowRoot?.querySelector('[part="video"]') as HTMLVideoElement;
      video.dispatchEvent(new Event("loadedmetadata"));
      await elementUpdated(el);
      const mute = el.shadowRoot?.querySelector('[part="mute"]') as HTMLButtonElement;
      mute?.click();
      await elementUpdated(el);
      expect(el.shadowRoot?.querySelector('[part="volume-popover"][data-open]')).toBeTruthy();
      const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
      base?.focus();
      dispatchKey(base, "Escape");
      await elementUpdated(el);
      expect(el.shadowRoot?.querySelector('[part="volume-popover"][data-open]')).toBeFalsy();
    });
  });

  describe("accessibility", () => {
    it("with label and controls", async () => {
      const el = await fixture<VuVideo>(
        html`<vu-video src=${sampleSrc} label="Product demo"></vu-video>`,
      );
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("without custom controls", async () => {
      const el = await fixture<VuVideo>(
        html`<vu-video
          src=${sampleSrc}
          label="Background loop"
          .controls=${false}
          muted
        ></vu-video>`,
      );
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });
  });
});

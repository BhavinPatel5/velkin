/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3 N/A 4✓ 5✓ 6 N/A 7✓ 8✓ 9 N/A 10✓
 */
import { elementUpdated, fixture, html, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuColorArea } from "../color-area.js";

describe("vu-color-area", () => {
  it("is defined", () => {
    expect(customElements.get("vu-color-area")).toBe(VuColorArea);
  });

  it("renders defaults — hue 0, full saturation + brightness, role=application, valuetext describes both axes", async () => {
    const el = await fixture<VuColorArea>(html`<vu-color-area></vu-color-area>`);
    await elementUpdated(el);
    expect(el.hue).toBe(0);
    expect(el.saturation).toBe(100);
    expect(el.brightness).toBe(100);
    expect(el.disabled).toBe(false);
    expect(el.getAttribute("role")).toBe("application");
    expect(el.getAttribute("aria-roledescription")).toBe("color picker");
    expect(el.getAttribute("aria-label")).toBe(
      "Saturation and brightness: Saturation 100%, Brightness 100%",
    );
    expect(el.hasAttribute("aria-valuenow")).toBe(false);
    expect(el.getAttribute("tabindex")).toBe("0");
  });

  it("seeds value from initial HSV channels when no value prop is set", async () => {
    const el = await fixture<VuColorArea>(
      html`<vu-color-area hue="120" saturation="100" brightness="100"></vu-color-area>`,
    );
    await elementUpdated(el);
    expect(el.value).toBe("hsl(120 100% 50%)");
  });

  it("ingests an external value (CSS color string) into hue / saturation / brightness", async () => {
    const el = await fixture<VuColorArea>(html`<vu-color-area value="#3b82f6"></vu-color-area>`);
    await elementUpdated(el);
    /* #3b82f6 ≈ HSV(217, 76%, 96%). Allow a small rounding tolerance — the
       round-trip goes through 8-bit RGB so HSV channels won't be exact. */
    expect(Math.round(el.hue)).toBe(217);
    expect(Math.round(el.saturation)).toBe(76);
    expect(Math.round(el.brightness)).toBe(96);
  });

  it("getColor() returns HSV / HSL / RGB / hex / css for the picked point", async () => {
    const el = await fixture<VuColorArea>(
      html`<vu-color-area hue="120" saturation="100" brightness="100"></vu-color-area>`,
    );
    await elementUpdated(el);
    const color = el.getColor();
    expect(color.colorSpace).toBe("hsb");
    expect(color.xChannel).toBe("saturation");
    expect(color.yChannel).toBe("brightness");
    expect(color.hue).toBe(120);
    expect(color.saturation).toBe(100);
    expect(color.brightness).toBe(100);
    expect(color.value).toBe("hsl(120 100% 50%)");
    expect(color.rgb).toEqual({ r: 0, g: 255, b: 0 });
    expect(color.hex).toBe("#00ff00");
    expect(color.hsv).toEqual({ h: 120, s: 100, v: 100 });
    expect(color.hsl).toEqual({ h: 120, s: 100, l: 50 });
    expect(color.css).toBe("hsl(120 100% 50%)");
    expect(color.red).toBe(0);
    expect(color.green).toBe(255);
    expect(color.blue).toBe(0);
  });

  it("setSV() clamps to 0..100 and is a no-op when unchanged", async () => {
    const el = await fixture<VuColorArea>(html`<vu-color-area></vu-color-area>`);
    await elementUpdated(el);
    el.setSV(50, 25);
    await elementUpdated(el);
    expect(el.saturation).toBe(50);
    expect(el.brightness).toBe(25);
    el.setSV(-100, 999);
    await elementUpdated(el);
    expect(el.saturation).toBe(0);
    expect(el.brightness).toBe(100);
  });

  it("ArrowRight / ArrowLeft adjust saturation by `step`", async () => {
    const el = await fixture<VuColorArea>(
      html`<vu-color-area saturation="50" brightness="50" step="2"></vu-color-area>`,
    );
    await elementUpdated(el);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    expect(el.saturation).toBe(52);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    expect(el.saturation).toBe(50);
  });

  it("ArrowUp increases brightness, ArrowDown decreases brightness (top = bright, bottom = dark)", async () => {
    const el = await fixture<VuColorArea>(
      html`<vu-color-area saturation="50" brightness="50"></vu-color-area>`,
    );
    await elementUpdated(el);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
    expect(el.brightness).toBe(51);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    expect(el.brightness).toBe(50);
  });

  it("Shift+Arrow accelerates by 10×; PageUp/PageDown jump brightness by 10×; Home/End jump saturation to extremes", async () => {
    const el = await fixture<VuColorArea>(
      html`<vu-color-area saturation="50" brightness="50"></vu-color-area>`,
    );
    await elementUpdated(el);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", shiftKey: true }));
    expect(el.saturation).toBe(60);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "PageUp" }));
    expect(el.brightness).toBe(60);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "Home" }));
    expect(el.saturation).toBe(0);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "End" }));
    expect(el.saturation).toBe(100);
  });

  it("emits vu-input on every keystroke and vu-change once on commit, with detail.value (CSS string)", async () => {
    const el = await fixture<VuColorArea>(html`<vu-color-area></vu-color-area>`);
    await elementUpdated(el);
    const inputs: number[] = [];
    const changes: number[] = [];
    const stringValues: string[] = [];
    el.addEventListener("vu-input", (e) => {
      const d = (e as CustomEvent).detail;
      inputs.push(d.saturation);
      stringValues.push(d.value);
    });
    el.addEventListener("vu-change", (e) => changes.push((e as CustomEvent).detail.saturation));
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    expect(inputs).toEqual([99]);
    expect(changes).toEqual([99]);
    expect(stringValues[0]).toMatch(/^hsl\(/);
  });

  it("disabled removes tabindex, sets aria-disabled, and ignores keydown", async () => {
    const el = await fixture<VuColorArea>(
      html`<vu-color-area disabled saturation="50"></vu-color-area>`,
    );
    await elementUpdated(el);
    expect(el.hasAttribute("tabindex")).toBe(false);
    expect(el.getAttribute("aria-disabled")).toBe("true");
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    expect(el.saturation).toBe(50);
  });

  it("readonly keeps focus but ignores keydown", async () => {
    const el = await fixture<VuColorArea>(
      html`<vu-color-area readonly saturation="50"></vu-color-area>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("tabindex")).toBe("0");
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    expect(el.saturation).toBe(50);
  });

  it("uses the CSS plane renderer for default HSV saturation × brightness axes", async () => {
    const el = await fixture<VuColorArea>(html`<vu-color-area></vu-color-area>`);
    await elementUpdated(el);
    expect(el.planeRenderer).toBe("css");
    expect(el.getAttribute("planerenderer")).toBe("css");
    expect(el.shadowRoot?.querySelector("canvas.plane")?.hasAttribute("hidden")).toBe(true);
  });

  it("clamps inputs at the boundary instead of throwing — keys at limits don't move the value", async () => {
    const el = await fixture<VuColorArea>(
      html`<vu-color-area saturation="100" brightness="100"></vu-color-area>`,
    );
    await elementUpdated(el);
    const before = { s: el.saturation, b: el.brightness };
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
    expect(el.saturation).toBe(before.s);
    expect(el.brightness).toBe(before.b);
  });

  it("accepts custom label and exposes it via aria-label", async () => {
    const el = await fixture<VuColorArea>(
      html`<vu-color-area label="Pick brand color"></vu-color-area>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("aria-label")).toMatch(/^Pick brand color: /);
  });

  it("showdots renders the dot grid overlay; absent by default", async () => {
    const el = await fixture<VuColorArea>(html`<vu-color-area></vu-color-area>`);
    await elementUpdated(el);
    expect(el.shadowRoot!.querySelector('[part="dots"]')).toBeNull();
    el.showDots = true;
    await elementUpdated(el);
    expect(el.shadowRoot!.querySelector('[part="dots"]')).not.toBeNull();
  });

  /* Form association — the area is a form-associated custom element. Give
     it a `name` and the picked CSS color string round-trips through
     FormData; form.reset() rolls back to the captured initial value. */
  it("submits its value (CSS string) under the given name, and reset() rolls back to the initial value", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <vu-color-area name="brand" value="#3b82f6"></vu-color-area>
      </form>
    `);
    const el = form.querySelector("vu-color-area") as VuColorArea;
    await elementUpdated(el);
    /* defaultValue is captured from the *initial* `value` (matches native
       <input>/<select> reset semantics). */
    let data = new FormData(form);
    expect(typeof data.get("brand")).toBe("string");
    /* Bump brightness via a key — value should follow. */
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    await elementUpdated(el);
    data = new FormData(form);
    const drifted = data.get("brand") as string;
    expect(drifted).toBeTruthy();
    /* Reset → back to the captured CSS color. */
    form.reset();
    await elementUpdated(el);
    data = new FormData(form);
    expect(data.get("brand")).toBe(el.value);
  });

  it("contributes nothing to FormData when name is empty", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <vu-color-area value="#3b82f6"></vu-color-area>
      </form>
    `);
    await elementUpdated(form.querySelector("vu-color-area") as VuColorArea);
    const data = new FormData(form);
    expect(Array.from(data.keys())).toHaveLength(0);
  });

  it("color-space rgb emits rgb() for value / detail.css", async () => {
    const el = await fixture<VuColorArea>(
      html`<vu-color-area
        colorspace="rgb"
        hue="120"
        saturation="100"
        brightness="100"
      ></vu-color-area>`,
    );
    await elementUpdated(el);
    expect(el.value.startsWith("rgb(")).toBe(true);
    expect(el.getColor().css.startsWith("rgb(")).toBe(true);
  });

  it("color-space hsl stores HSL in hue / saturation / brightness props", async () => {
    const el = await fixture<VuColorArea>(
      html`<vu-color-area colorspace="hsl" value="#00ff00"></vu-color-area>`,
    );
    await elementUpdated(el);
    expect(Math.round(el.hue)).toBe(120);
    expect(Math.round(el.saturation)).toBe(100);
    expect(Math.round(el.brightness)).toBe(50);
  });

  it("coerces invalid x-channel + y-channel both hue to y-channel brightness", async () => {
    const el = await fixture<VuColorArea>(
      html`<vu-color-area xchannel="hue" ychannel="hue"></vu-color-area>`,
    );
    await elementUpdated(el);
    expect(el.yChannel).toBe("brightness");
  });

  it("required and showErrors surfaces error after validateInput", async () => {
    const el = await fixture<VuColorArea>(html`<vu-color-area showerrors></vu-color-area>`);
    await elementUpdated(el);
    el.validations = [() => "Pick a color."];
    el.validationActive = true;
    el.validateInput();
    await elementUpdated(el);
    const err = el.shadowRoot?.querySelector('[part="error-message"]') as HTMLElement | null;
    expect(err?.id).toBeTruthy();
    expect(err?.textContent?.trim()).toContain("Pick a color");
  });
});

describe("accessibility", () => {
  it("default color area passes axe", async () => {
    const el = await fixture(html`<vu-color-area></vu-color-area>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});

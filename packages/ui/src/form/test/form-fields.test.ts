/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1 N/A 2 N/A 3 N/A 4 N/A 5 N/A 6 N/A 7 N/A 8✓ 9✓ 10 N/A
 */
import { fixture, html, elementUpdated } from "@open-wc/testing";
import { expect } from "vitest";
import { VuButton } from "../../button/button.js";
import { VuCheckbox } from "../../checkbox/checkbox.js";
import { VuCheckboxGroup } from "../../checkbox-group/checkbox-group.js";
import { VuColorArea } from "../../color-area/color-area.js";
import { VuColorPicker } from "../../color-picker/color-picker.js";
import { VuColorSlider } from "../../color-slider/color-slider.js";
import { VuColorSwatchPicker } from "../../color-swatch-picker/color-swatch-picker.js";
import { VuCombobox } from "../../combobox/combobox.js";
import { VuCounter } from "../../counter/counter.js";
import "../../icon/icon.js";
import { VuOtp } from "../../otp/otp.js";
import { VuRadio } from "../../radio/radio.js";
import { VuRadioGroup } from "../../radio-group/radio-group.js";
import { VuRange } from "../../range/range.js";
import { VuSerial } from "../../serial/serial.js";
import { VuSlider } from "../../slider/slider.js";
import { VuSwitch } from "../../switch/switch.js";
import { VuForm } from "../form.js";
import type { VuFormSubmitDetail } from "../form.types.js";

async function submitForm(el: VuForm): Promise<VuFormSubmitDetail | undefined> {
  let submitted: VuFormSubmitDetail | undefined;
  const onSubmit = ((e: CustomEvent<VuFormSubmitDetail>) => {
    submitted = e.detail;
  }) as EventListener;
  el.addEventListener("vu-submit", onSubmit);
  el.submit();
  await elementUpdated(el);
  el.removeEventListener("vu-submit", onSubmit);
  return submitted;
}

describe("vu-form field compatibility", () => {
  it("upgrades vu-form and form-associated fields", async () => {
    expect(customElements.get("vu-form")).toBe(VuForm);
    expect(customElements.get("vu-button")).toBe(VuButton);
    expect(customElements.get("vu-checkbox")).toBe(VuCheckbox);
    expect(customElements.get("vu-checkbox-group")).toBe(VuCheckboxGroup);
    expect(customElements.get("vu-color-area")).toBe(VuColorArea);
    expect(customElements.get("vu-color-picker")).toBe(VuColorPicker);
    expect(customElements.get("vu-color-slider")).toBe(VuColorSlider);
    expect(customElements.get("vu-color-swatch-picker")).toBe(VuColorSwatchPicker);
    expect(customElements.get("vu-combobox")).toBe(VuCombobox);
    expect(customElements.get("vu-counter")).toBe(VuCounter);
    expect(customElements.get("vu-otp")).toBe(VuOtp);
    expect(customElements.get("vu-radio")).toBe(VuRadio);
    expect(customElements.get("vu-radio-group")).toBe(VuRadioGroup);
    expect(customElements.get("vu-range")).toBe(VuRange);
    expect(customElements.get("vu-serial")).toBe(VuSerial);
    expect(customElements.get("vu-slider")).toBe(VuSlider);
    expect(customElements.get("vu-switch")).toBe(VuSwitch);
    const el = await fixture<VuForm>(html`<vu-form></vu-form>`);
    await elementUpdated(el);
    expect(el).toBeInstanceOf(VuForm);
    expect(typeof el.reset).toBe("function");
  });
  it("submits vu-checkbox and vu-switch only when checked", async () => {
    const el = await fixture<VuForm>(html`
      <vu-form>
        <vu-checkbox name="agree" value="yes"></vu-checkbox>
        <vu-switch name="alerts"></vu-switch>
        <vu-button type="submit">Save</vu-button>
      </vu-form>
    `);
    await elementUpdated(el);
    await elementUpdated(el);

    const empty = await submitForm(el);
    expect(empty?.values.agree).toBeUndefined();
    expect(empty?.values.alerts).toBeUndefined();

    (el.querySelector("vu-checkbox") as VuCheckbox).checked = true;
    (el.querySelector("vu-switch") as VuSwitch).checked = true;
    await elementUpdated(el);

    const submitted = await submitForm(el);
    expect(submitted?.success).toBe(true);
    expect(submitted?.values.agree).toBe("yes");
    expect(submitted?.values.alerts).toBe("on");
  });

  it("submits vu-otp, vu-serial, vu-slider, vu-counter, and vu-range", async () => {
    const el = await fixture<VuForm>(html`
      <vu-form>
        <vu-otp name="code"></vu-otp>
        <vu-serial name="serial"></vu-serial>
        <vu-slider name="volume"></vu-slider>
        <vu-counter name="qty"></vu-counter>
        <vu-range name="span"></vu-range>
        <vu-button type="submit">Save</vu-button>
      </vu-form>
    `);
    await elementUpdated(el);
    await elementUpdated(el);

    (el.querySelector("vu-otp") as VuOtp).value = "123456";
    (el.querySelector("vu-serial") as VuSerial).value = "1234567890";
    (el.querySelector("vu-slider") as VuSlider).value = 42;
    (el.querySelector("vu-counter") as VuCounter).value = 3;
    const range = el.querySelector("vu-range") as VuRange;
    range.from = 10;
    range.to = 40;
    await elementUpdated(el);

    const submitted = await submitForm(el);
    expect(submitted?.success).toBe(true);
    expect(submitted?.values.code).toBe("123456");
    expect(submitted?.values.serial).toBe("1234567890");
    expect(String(submitted?.values.volume)).toBe("42");
    expect(String(submitted?.values.qty)).toBe("3");
    expect(submitted?.values.span).toBe("10,40");
  });

  it("submits vu-combobox and vu-color-picker values", async () => {
    const el = await fixture<VuForm>(html`
      <vu-form>
        <vu-combobox name="color" .options=${["Red", "Blue"]}></vu-combobox>
        <vu-color-picker name="hex"></vu-color-picker>
        <vu-button type="submit">Save</vu-button>
      </vu-form>
    `);
    await elementUpdated(el);
    await elementUpdated(el);

    (el.querySelector("vu-combobox") as VuCombobox).value = "Red";
    (el.querySelector("vu-color-picker") as VuColorPicker).value = "#112233";
    await elementUpdated(el);

    const submitted = await submitForm(el);
    expect(submitted?.success).toBe(true);
    expect(submitted?.values.color).toBe("Red");
    expect(submitted?.values.hex).toBe("#112233");
  });

  it("submits vu-color-slider, vu-color-area, and vu-color-swatch-picker", async () => {
    const el = await fixture<VuForm>(html`
      <vu-form>
        <vu-color-slider name="hue"></vu-color-slider>
        <vu-color-area name="fill"></vu-color-area>
        <vu-color-swatch-picker name="swatch">
          <vu-color-swatch value="#ff0000"></vu-color-swatch>
          <vu-color-swatch value="#00ff00"></vu-color-swatch>
        </vu-color-swatch-picker>
        <vu-button type="submit">Save</vu-button>
      </vu-form>
    `);
    await elementUpdated(el);
    await elementUpdated(el);

    (el.querySelector("vu-color-slider") as VuColorSlider).value = "#336699";
    (el.querySelector("vu-color-area") as VuColorArea).value = "#abcdef";
    (el.querySelector("vu-color-swatch-picker") as VuColorSwatchPicker).value = "#00ff00";
    await elementUpdated(el);

    const submitted = await submitForm(el);
    expect(submitted?.success).toBe(true);
    expect(submitted?.values.hue).toBe("#336699");
    expect(String(submitted?.values.fill ?? "")).not.toBe("");
    expect(submitted?.values.swatch).toBe("#00ff00");
  });

  it("submits the checked vu-radio token and ignores unchecked siblings", async () => {
    const el = await fixture<VuForm>(html`
      <vu-form>
        <vu-radio-group name="plan">
          <vu-radio value="a" label="A"></vu-radio>
          <vu-radio value="b" label="B"></vu-radio>
        </vu-radio-group>
        <vu-button type="submit">Save</vu-button>
      </vu-form>
    `);
    await elementUpdated(el);
    await elementUpdated(el);

    const group = el.querySelector("vu-radio-group") as VuRadioGroup;
    expect(group).toBeInstanceOf(VuRadioGroup);
    group.value = "b";
    await elementUpdated(group);
    await Promise.resolve();
    await elementUpdated(el);

    const radios = [...el.querySelectorAll("vu-radio")] as VuRadio[];
    radios[1].checked = true;
    await elementUpdated(radios[1]);

    const submitted = await submitForm(el);
    expect(submitted?.success).toBe(true);
    expect(submitted?.values.plan).toBe("b");
  });

  it("submits a standalone named vu-radio when checked", async () => {
    const el = await fixture<VuForm>(html`
      <vu-form>
        <vu-radio name="opt" value="x"></vu-radio>
        <vu-button type="submit">Save</vu-button>
      </vu-form>
    `);
    await elementUpdated(el);

    const empty = await submitForm(el);
    expect(empty?.values.opt).toBeUndefined();

    const radio = el.querySelector("vu-radio") as VuRadio;
    expect(radio).toBeInstanceOf(VuRadio);
    radio.value = "x";
    radio.checked = true;
    await elementUpdated(radio);

    const submitted = await submitForm(el);
    expect(submitted?.values.opt).toBe("x");
  });

  it("submits checked checkbox-group members under the group name", async () => {
    const el = await fixture<VuForm>(html`
      <vu-form>
        <vu-checkbox-group name="langs">
          <vu-checkbox value="js" label="JS"></vu-checkbox>
          <vu-checkbox value="ts" label="TS"></vu-checkbox>
        </vu-checkbox-group>
        <vu-button type="submit">Save</vu-button>
      </vu-form>
    `);
    await elementUpdated(el);
    await elementUpdated(el);

    const group = el.querySelector("vu-checkbox-group") as VuCheckboxGroup;
    expect(group).toBeInstanceOf(VuCheckboxGroup);
    group.values = ["js", "ts"];
    const boxes = [...el.querySelectorAll("vu-checkbox")] as VuCheckbox[];
    boxes[0].checked = true;
    boxes[1].checked = true;
    await elementUpdated(el);
    await Promise.resolve();

    const submitted = await submitForm(el);
    expect(submitted?.success).toBe(true);
    expect(submitted?.values.langs).toEqual(["js", "ts"]);
  });

  it("blocks submit when a required vu-checkbox is unchecked", async () => {
    const el = await fixture<VuForm>(html`
      <vu-form>
        <vu-checkbox name="terms" required></vu-checkbox>
        <vu-button type="submit">Save</vu-button>
      </vu-form>
    `);
    await elementUpdated(el);
    await elementUpdated(el);

    const terms = el.querySelector("vu-checkbox") as VuCheckbox;
    expect(terms).toBeInstanceOf(VuCheckbox);
    const submitted = await submitForm(el);
    expect(submitted).toBeUndefined();
    expect(terms.invalid).toBe(true);
  });

  it("resets checkbox, switch, and otp through VuForm.reset()", async () => {
    const el = await fixture<VuForm>(html`
      <vu-form>
        <vu-checkbox name="agree"></vu-checkbox>
        <vu-switch name="alerts"></vu-switch>
        <vu-otp name="code"></vu-otp>
      </vu-form>
    `);
    await elementUpdated(el);
    await elementUpdated(el);

    const checkbox = el.querySelector("vu-checkbox") as VuCheckbox;
    const sw = el.querySelector("vu-switch") as VuSwitch;
    const otp = el.querySelector("vu-otp") as VuOtp;
    expect(checkbox).toBeInstanceOf(VuCheckbox);
    expect(sw).toBeInstanceOf(VuSwitch);
    expect(otp).toBeInstanceOf(VuOtp);
    expect(typeof sw.formResetCallback).toBe("function");
    checkbox.checked = true;
    sw.checked = true;
    otp.value = "123456";
    await elementUpdated(el);

    el.reset();
    await Promise.resolve();
    await Promise.resolve();
    await elementUpdated(el);
    await elementUpdated(checkbox);
    await elementUpdated(sw);
    await elementUpdated(otp);

    expect(checkbox.checked).toBe(false);
    expect(sw.checked).toBe(false);
    expect(otp.value).toBe("");
  });
});

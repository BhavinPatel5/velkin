/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3 N/A 4 N/A 5 N/A 6 N/A 7 N/A 8✓ 9✓ 10✓
 */
import { fixture, html, elementUpdated } from "@open-wc/testing";
import { expect } from "vitest";
import { VuButton } from "../../button/button.js";
import { VuInput } from "../../input/input.js";
import { VuOtp } from "../../otp/otp.js";
import "../../icon/icon.js";
import { VuForm } from "../form.js";
import type { VuFormChangeDetail, VuFormSubmitDetail } from "../form.types.js";

describe("vu-form", () => {
  it("is defined", () => {
    expect(customElements.get("vu-form")).toBe(VuForm);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuForm>(html`<vu-form></vu-form>`);
    await elementUpdated(el);
    expect(el.liveValidation).toBe(false);
    expect(el.showErrors).toBe(true);
    expect(el.mode).toBe("client");
    expect(el.formElement).toBeTruthy();
  });

  it("does not reflect empty name on unnamed child fields", async () => {
    const el = await fixture<VuForm>(html`
      <vu-form>
        <vu-input label="Email"></vu-input>
      </vu-form>
    `);
    await elementUpdated(el);
    const input = el.querySelector("vu-input") as VuInput;
    await elementUpdated(input);
    expect(input.hasAttribute("name")).toBe(false);
    expect(input.hasAttribute("defaultvalue")).toBe(false);
    expect(input.hasAttribute("formid")).toBe(false);
  });

  it("reflects boolean and server props", async () => {
    const el = await fixture<VuForm>(
      html`<vu-form livevalidation showerrors novalidate entersubmit></vu-form>`,
    );
    await elementUpdated(el);
    expect(el.liveValidation).toBe(true);
    expect(el.showErrors).toBe(true);
    expect(el.noValidate).toBe(true);
    expect(el.enterSubmit).toBe(true);
  });

  it("reflects mode, method, and action", async () => {
    const el = await fixture<VuForm>(
      html`<vu-form mode="server" method="post" action="/submit"></vu-form>`,
    );
    await elementUpdated(el);
    expect(el.mode).toBe("server");
    expect(el.method).toBe("post");
    expect(el.action).toBe("/submit");
  });

  it("copies host id onto the native form", async () => {
    const el = await fixture<VuForm>(html`<vu-form id="profile-form"></vu-form>`);
    await elementUpdated(el);
    await elementUpdated(el);
    expect(el.id).toBe("");
    expect(el.formElement.id).toBe("profile-form");
  });

  it("generates stable sequential form ids when host id is omitted", async () => {
    const a = await fixture<VuForm>(html`<vu-form></vu-form>`);
    const b = await fixture<VuForm>(html`<vu-form></vu-form>`);
    await elementUpdated(a);
    await elementUpdated(b);
    await elementUpdated(a);
    await elementUpdated(b);
    expect(a.formElement.id).toMatch(/^vu-form-\d+$/);
    expect(b.formElement.id).toMatch(/^vu-form-\d+$/);
    expect(a.formElement.id).not.toBe(b.formElement.id);
  });

  it("assigns form= ownership to light-DOM sibling controls", async () => {
    const el = await fixture<VuForm>(html`
      <vu-form id="owned-form">
        <input name="email" />
      </vu-form>
    `);
    await elementUpdated(el);
    await elementUpdated(el);
    const input = el.querySelector("input");
    expect(el.formElement.id).toBe("owned-form");
    expect(input?.closest("form")).toBeNull();
    expect(input?.getAttribute("form")).toBe("owned-form");
  });

  it("emits vu-submit in client mode", async () => {
    const el = await fixture<VuForm>(html`
      <vu-form>
        <input name="email" value="user@example.com" />
        <button type="submit">Save</button>
      </vu-form>
    `);
    await elementUpdated(el);
    await elementUpdated(el);

    let submitted: VuFormSubmitDetail | undefined;
    el.addEventListener("vu-submit", ((e: CustomEvent<VuFormSubmitDetail>) => {
      submitted = e.detail;
    }) as EventListener);

    el.requestSubmit();
    await elementUpdated(el);

    expect(submitted?.values.email).toBe("user@example.com");
    expect(submitted?.success).toBe(true);
  });

  it("does not activate child validationActive on mount", async () => {
    const el = await fixture<VuForm>(html`
      <vu-form>
        <vu-input name="email" label="Email" required></vu-input>
        <button type="submit">Save</button>
      </vu-form>
    `);
    await elementUpdated(el);
    await elementUpdated(el);

    const input = el.querySelector("vu-input")!;
    expect(input.hasAttribute("validationactive")).toBe(false);
  });

  it("activates child validationActive after failed submit", async () => {
    const el = await fixture<VuForm>(html`
      <vu-form>
        <vu-input name="email" label="Email" required></vu-input>
        <button type="submit">Save</button>
      </vu-form>
    `);
    await elementUpdated(el);
    await elementUpdated(el);

    const input = el.querySelector<VuInput>("vu-input")!;
    el.requestSubmit();
    await elementUpdated(el);

    expect(input.validationActive).toBe(true);
    expect(input.showErrors).toBe(true);
  });

  it("emits vu-change when liveValidation is on", async () => {
    const el = await fixture<VuForm>(html`
      <vu-form livevalidation>
        <input name="email" value="user@example.com" />
      </vu-form>
    `);
    await elementUpdated(el);

    const input = el.querySelector("input")!;
    let changed: VuFormChangeDetail | undefined;
    el.addEventListener("vu-change", ((e: CustomEvent<VuFormChangeDetail>) => {
      changed = e.detail;
    }) as EventListener);

    input.value = "next@example.com";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(
      new CustomEvent("value-changed", { bubbles: true, composed: true, detail: {} }),
    );
    await elementUpdated(el);

    expect(changed?.values.email).toBe("next@example.com");
    expect(typeof changed?.success).toBe("boolean");
  });

  it("liveValidation vu-change success stays false until required vu-input is filled", async () => {
    const el = await fixture<VuForm>(html`
      <vu-form livevalidation>
        <vu-input name="email" label="Email" required></vu-input>
        <vu-button type="submit">Continue</vu-button>
      </vu-form>
    `);
    await elementUpdated(el);
    await elementUpdated(el);

    const field = el.querySelector("vu-input") as VuInput;
    await elementUpdated(field);

    let last: VuFormChangeDetail | undefined;
    el.addEventListener("vu-change", ((e: CustomEvent<VuFormChangeDetail>) => {
      last = e.detail;
    }) as EventListener);

    field.value = "";
    field.dispatchEvent(
      new CustomEvent("vu-change", { bubbles: true, composed: true, detail: { value: "" } }),
    );
    await elementUpdated(el);
    expect(last?.success).toBe(false);

    field.value = "ada@example.com";
    await elementUpdated(field);
    field.dispatchEvent(
      new CustomEvent("vu-change", {
        bubbles: true,
        composed: true,
        detail: { value: "ada@example.com" },
      }),
    );
    await elementUpdated(el);
    expect(last?.success).toBe(true);
    expect(last?.values.email).toBe("ada@example.com");
  });

  it("emits vu-submit when a slotted vu-button type=submit is clicked", async () => {
    const el = await fixture<VuForm>(html`
      <vu-form>
        <vu-input name="email" label="Email" .value=${"user@example.com"}></vu-input>
        <vu-button type="submit">Save</vu-button>
      </vu-form>
    `);
    await elementUpdated(el);
    await elementUpdated(el);

    const input = el.querySelector("vu-input") as VuInput;
    await elementUpdated(input);
    expect(customElements.get("vu-input")).toBe(VuInput);
    input.value = "user@example.com";
    await elementUpdated(input);

    let submitted: VuFormSubmitDetail | undefined;
    el.addEventListener("vu-submit", ((e: CustomEvent<VuFormSubmitDetail>) => {
      submitted = e.detail;
    }) as EventListener);

    const button = el.querySelector("vu-button") as VuButton;
    await elementUpdated(button);
    expect(button).toBeInstanceOf(VuButton);
    button.click();
    await elementUpdated(el);

    expect(submitted?.values.email).toBe("user@example.com");
    expect(submitted?.success).toBe(true);
  });

  it("does not emit vu-submit when required vu-input is empty", async () => {
    const el = await fixture<VuForm>(html`
      <vu-form>
        <vu-input name="email" label="Email" required></vu-input>
        <vu-button type="submit">Save</vu-button>
      </vu-form>
    `);
    await elementUpdated(el);
    await elementUpdated(el);

    const field = el.querySelector("vu-input") as VuInput;
    await elementUpdated(field);
    expect(customElements.get("vu-input")).toBe(VuInput);

    let submitted = 0;
    el.addEventListener("vu-submit", () => {
      submitted += 1;
    });

    const button = el.querySelector("vu-button") as VuButton;
    await elementUpdated(button);
    expect(button).toBeInstanceOf(VuButton);
    button.click();
    await elementUpdated(el);

    expect(submitted).toBe(0);
    expect(field.invalid).toBe(true);
  });

  it("does not emit vu-submit when vu-input custom validations fail", async () => {
    const el = await fixture<VuForm>(html`
      <vu-form>
        <vu-input
          name="email"
          label="Email"
          .value=${"hello"}
          .validations=${[(value: string) => value.includes("@") || "Enter a valid email"]}
        ></vu-input>
        <vu-button type="submit">Save</vu-button>
      </vu-form>
    `);
    await elementUpdated(el);
    await elementUpdated(el);

    const field = el.querySelector("vu-input") as VuInput;
    await elementUpdated(field);

    let submitted = 0;
    el.addEventListener("vu-submit", () => {
      submitted += 1;
    });

    const button = el.querySelector("vu-button") as VuButton;
    await elementUpdated(button);
    button.click();
    await elementUpdated(el);

    expect(submitted).toBe(0);
    expect(field.invalid).toBe(true);
    expect(field.validationErrors[0]).toBe("Enter a valid email");
  });

  it("emits vu-submit when vu-input custom validations pass", async () => {
    const el = await fixture<VuForm>(html`
      <vu-form>
        <vu-input
          name="email"
          label="Email"
          .value=${"ada@example.com"}
          .validations=${[(value: string) => value.includes("@") || "Enter a valid email"]}
        ></vu-input>
        <vu-button type="submit">Save</vu-button>
      </vu-form>
    `);
    await elementUpdated(el);
    await elementUpdated(el);

    const field = el.querySelector("vu-input") as VuInput;
    await elementUpdated(field);
    field.value = "ada@example.com";
    await elementUpdated(field);

    let submitted: VuFormSubmitDetail | undefined;
    el.addEventListener("vu-submit", ((e: CustomEvent<VuFormSubmitDetail>) => {
      submitted = e.detail;
    }) as EventListener);

    const button = el.querySelector("vu-button") as VuButton;
    await elementUpdated(button);
    button.click();
    await elementUpdated(el);

    expect(submitted?.success).toBe(true);
    expect(submitted?.values.email).toBe("ada@example.com");
  });

  it("liveValidation vu-change success stays false while custom validations fail", async () => {
    const el = await fixture<VuForm>(html`
      <vu-form livevalidation>
        <vu-input
          name="email"
          label="Email"
          .validations=${[(value: string) => value.includes("@") || "Enter a valid email"]}
        ></vu-input>
        <vu-button type="submit">Continue</vu-button>
      </vu-form>
    `);
    await elementUpdated(el);
    await elementUpdated(el);

    const field = el.querySelector("vu-input") as VuInput;
    await elementUpdated(field);

    let last: VuFormChangeDetail | undefined;
    el.addEventListener("vu-change", ((e: CustomEvent<VuFormChangeDetail>) => {
      last = e.detail;
    }) as EventListener);

    field.value = "hello";
    field.dispatchEvent(
      new CustomEvent("vu-change", {
        bubbles: true,
        composed: true,
        detail: { value: "hello" },
      }),
    );
    await elementUpdated(el);
    expect(last?.success).toBe(false);

    field.value = "ada@example.com";
    await elementUpdated(field);
    field.dispatchEvent(
      new CustomEvent("vu-change", {
        bubbles: true,
        composed: true,
        detail: { value: "ada@example.com" },
      }),
    );
    await elementUpdated(el);
    expect(last?.success).toBe(true);
    expect(last?.values.email).toBe("ada@example.com");
  });

  it("inherits validations on vu-otp from FormControlBase", async () => {
    expect(customElements.get("vu-otp")).toBe(VuOtp);
    const el = await fixture<VuForm>(html`
      <vu-form>
        <vu-otp
          name="code"
          .validations=${[(value: string) => value === "123456" || "Use the demo code"]}
        ></vu-otp>
        <vu-button type="submit">Save</vu-button>
      </vu-form>
    `);
    await elementUpdated(el);
    await elementUpdated(el);

    const field = el.querySelector("vu-otp") as VuOtp;
    field.value = "000000";
    await elementUpdated(field);

    let submitted = 0;
    el.addEventListener("vu-submit", () => {
      submitted += 1;
    });

    const button = el.querySelector("vu-button") as VuButton;
    await elementUpdated(button);
    button.click();
    await elementUpdated(el);
    expect(submitted).toBe(0);
    expect(field.invalid).toBe(true);

    field.value = "123456";
    await elementUpdated(field);
    button.click();
    await elementUpdated(el);
    expect(submitted).toBe(1);
  });

  it("submits from a slotted vu-button even when form= points at a missing document id", async () => {
    const el = await fixture<VuForm>(html`
      <vu-form>
        <vu-input name="email" label="Email" .value=${"user@example.com"}></vu-input>
        <vu-button type="submit" form="missing-form-id">Save</vu-button>
      </vu-form>
    `);
    await elementUpdated(el);
    await elementUpdated(el);

    const input = el.querySelector("vu-input") as VuInput;
    await elementUpdated(input);
    input.value = "user@example.com";
    await elementUpdated(input);

    let submitted: VuFormSubmitDetail | undefined;
    el.addEventListener("vu-submit", ((e: CustomEvent<VuFormSubmitDetail>) => {
      submitted = e.detail;
    }) as EventListener);

    const button = el.querySelector("vu-button") as VuButton;
    await elementUpdated(button);
    button.click();
    await elementUpdated(el);

    expect(submitted?.values.email).toBe("user@example.com");
    expect(submitted?.success).toBe(true);
  });
});

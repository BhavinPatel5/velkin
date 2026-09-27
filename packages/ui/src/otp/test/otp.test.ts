/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6✓ 7 N/A 8✓ 9✓ 10 N/A
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect, vi } from "vitest";
import {
  dispatchKey,
  mockActiveElement,
  spyNextFocus,
} from "../../../internals/test/keyboard-test-helpers.js";
import { handleOtpPaste } from "../internals/otp-input.js";
import { VuOtp } from "../otp.js";

describe("vu-otp", () => {
  it("is defined", () => {
    expect(customElements.get("vu-otp")).toBe(VuOtp);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuOtp>(html`<vu-otp></vu-otp>`);
    await elementUpdated(el);
    expect(el.length).toBe(6);
    expect(el.value).toBe("");
    expect(el.alphanumeric).toBe(false);
    expect(el.masked).toBe(false);
    expect(el.size).toBe("md");
    expect(el.variant).toBe("default");
    expect(el.tone).toBe("normal");
    expect(el.radius).toBe("md");
    const cells = el.shadowRoot?.querySelectorAll('[part="cell"]');
    expect(cells?.length).toBe(6);
  });

  it("accepts length, value, alphanumeric, masked", async () => {
    const el = await fixture<VuOtp>(
      html`<vu-otp .length=${4} value="12" alphanumeric masked></vu-otp>`,
    );
    await elementUpdated(el);
    expect(el.length).toBe(4);
    expect(el.value).toBe("12");
    expect(el.alphanumeric).toBe(true);
    expect(el.masked).toBe(true);
    expect(el.shadowRoot?.querySelectorAll('[part="cell"]').length).toBe(4);
  });

  it("renders label when provided", async () => {
    const el = await fixture<VuOtp>(html`<vu-otp label="Verification code"></vu-otp>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="text"]')?.textContent?.trim()).toBe(
      "Verification code",
    );
  });

  it("dispatches vu-change on commit after typing", async () => {
    const el = await fixture<VuOtp>(html`<vu-otp .length=${4}></vu-otp>`);
    await elementUpdated(el);

    let detail: { value?: string } = {};
    el.addEventListener("vu-change", ((e: CustomEvent) => {
      detail = e.detail ?? {};
    }) as EventListener);

    const cells = el.shadowRoot?.querySelectorAll<HTMLInputElement>(".otp-cell");
    const digits = ["1", "2", "3", "4"];
    digits.forEach((digit, index) => {
      const cell = cells![index];
      cell.value = digit;
      cell.dispatchEvent(new InputEvent("input", { bubbles: true, data: digit }));
    });
    await elementUpdated(el);
    cells![3].dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await elementUpdated(el);

    expect(detail.value).toBe("1234");
  });

  it("accepts digit input in the first cell", async () => {
    const el = await fixture<VuOtp>(html`<vu-otp .length=${3}></vu-otp>`);
    await elementUpdated(el);
    const first = el.shadowRoot?.querySelector(".otp-cell") as HTMLInputElement;
    first.value = "1";
    first.dispatchEvent(new Event("input", { bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe("1");
  });

  it("rejects invalid digit when alphanumeric is false", async () => {
    const el = await fixture<VuOtp>(html`<vu-otp .length=${2}></vu-otp>`);
    await elementUpdated(el);
    const cell = el.shadowRoot?.querySelector(".otp-cell") as HTMLInputElement;
    const ie = new InputEvent("input", { bubbles: true, data: "a" });
    Object.defineProperty(ie, "target", { value: cell });
    cell.value = "a";
    cell.dispatchEvent(ie);
    await elementUpdated(el);
    expect(el.value).toBe("");
  });

  it("focusFirst focuses the first cell", async () => {
    const el = await fixture<VuOtp>(html`<vu-otp></vu-otp>`);
    await elementUpdated(el);
    el.focusFirst();
    const active = el.shadowRoot?.activeElement;
    expect(active?.classList.contains("otp-cell")).toBe(true);
  });

  it("reset restores defaultValue and fires vu-clear", async () => {
    const el = await fixture<VuOtp>(html`<vu-otp .defaultValue=${"12"} .length=${4}></vu-otp>`);
    await elementUpdated(el);
    el.value = "9999";
    await elementUpdated(el);
    let cleared: { value?: string } = {};
    el.addEventListener("vu-clear", ((e: CustomEvent) => {
      cleared = e.detail ?? {};
    }) as EventListener);
    el.reset();
    await elementUpdated(el);
    expect(el.value).toBe("12");
    expect(cleared.value).toBe("12");
  });

  it("submits value under name when complete", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <vu-otp name="code" value="123456"></vu-otp>
      </form>
    `);
    const el = form.querySelector("vu-otp") as VuOtp;
    await elementUpdated(el);
    expect(new FormData(form).get("code")).toBe("123456");
    expect(el.form).toBe(form);
  });

  it("omits value from FormData when disabled", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <vu-otp name="code" value="123456" disabled></vu-otp>
      </form>
    `);
    await elementUpdated(form.querySelector("vu-otp") as VuOtp);
    expect(new FormData(form).get("code")).toBeNull();
  });

  it("form.reset() restores defaultValue", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <vu-otp name="code" .defaultValue=${"12"} .length=${4}></vu-otp>
      </form>
    `);
    const el = form.querySelector("vu-otp") as VuOtp;
    await elementUpdated(el);
    el.value = "9999";
    await elementUpdated(el);
    form.reset();
    await elementUpdated(el);
    expect(el.value).toBe("12");
  });

  it("required and showErrors surfaces error after blur", async () => {
    const el = await fixture<VuOtp>(
      html`<vu-otp required showerrors label="Code" .length=${4}></vu-otp>`,
    );
    await elementUpdated(el);
    const cell = el.shadowRoot?.querySelector(".otp-cell") as HTMLInputElement;
    cell.focus();
    cell.blur();
    await elementUpdated(el);
    expect(el.validationActive).toBe(true);
    const err = el.shadowRoot?.querySelector('[part="error-message"]') as HTMLElement | null;
    expect(err?.textContent?.trim().length).toBeGreaterThan(0);
    expect(
      el.shadowRoot?.querySelector('[part="cells"]')?.getAttribute("aria-describedby"),
    ).toContain(err?.id ?? "");
  });

  it("renders string hint with part and aria wiring", async () => {
    const el = await fixture<VuOtp>(
      html`<vu-otp label="Code" hint="We sent a 6-digit code."></vu-otp>`,
    );
    await elementUpdated(el);
    const hint = el.shadowRoot?.querySelector('[part="hint"]') as HTMLElement | null;
    expect(hint?.textContent?.trim()).toBe("We sent a 6-digit code.");
    expect(
      el.shadowRoot?.querySelector('[part="cells"]')?.getAttribute("aria-describedby"),
    ).toContain(hint?.id ?? "");
  });

  it("does not toggle when readonly", async () => {
    const el = await fixture<VuOtp>(html`<vu-otp readonly value="1" .length=${2}></vu-otp>`);
    await elementUpdated(el);
    const cell = el.shadowRoot?.querySelector(".otp-cell") as HTMLInputElement;
    expect(cell.readOnly).toBe(true);
  });

  it("reflects variant, size, and pill", async () => {
    const el = await fixture<VuOtp>(
      html`<vu-otp variant="outline" size="sm" radius="full"></vu-otp>`,
    );
    await elementUpdated(el);
    expect(el.variant).toBe("outline");
    expect(el.size).toBe("sm");
    expect(el.radius).toBe("full");
    expect(el.getAttribute("variant")).toBe("outline");
  });

  it("renders slotted label and hides string label part", async () => {
    const el = await fixture<VuOtp>(html`
      <vu-otp label="Ignored">
        <span slot="label">Slotted <em>rich</em> label</span>
      </vu-otp>
    `);
    await elementUpdated(el);
    const slot = el.shadowRoot?.querySelector('slot[name="label"]') as HTMLSlotElement | undefined;
    const nodes = slot?.assignedNodes({ flatten: true }) ?? [];
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes.map((n) => (n as Node).textContent ?? "").join("")).toContain("Slotted");
  });

  it("sets aria-label on group when no label or label slot", async () => {
    const el = await fixture<VuOtp>(html`<vu-otp arialabel="Enter verification code"></vu-otp>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="cells"]')?.getAttribute("aria-label")).toBe(
      "Enter verification code",
    );
  });

  it("reflects compact on host", async () => {
    const el = await fixture<VuOtp>(html`<vu-otp compact label="c"></vu-otp>`);
    await elementUpdated(el);
    expect(el.compact).toBe(true);
    expect(el.hasAttribute("compact")).toBe(true);
  });

  it("respects disabled on cells", async () => {
    const el = await fixture<VuOtp>(html`<vu-otp disabled></vu-otp>`);
    await elementUpdated(el);
    expect(el.disabled).toBe(true);
    const cell = el.shadowRoot?.querySelector(".otp-cell") as HTMLInputElement;
    expect(cell?.disabled).toBe(true);
  });

  it("paste fills all cells and commits value", async () => {
    const el = await fixture<VuOtp>(html`<vu-otp .length=${4}></vu-otp>`);
    await elementUpdated(el);

    let detail: { value?: string } = {};
    el.addEventListener("vu-change", ((e: CustomEvent) => {
      detail = e.detail ?? {};
    }) as EventListener);

    const pasteEvent = {
      preventDefault: () => {},
      clipboardData: { getData: () => "1234" },
    } as unknown as ClipboardEvent;
    handleOtpPaste(el, pasteEvent);
    await elementUpdated(el);
    el.validateInput();
    const cells = el.shadowRoot?.querySelector(".otp-cell") as HTMLInputElement;
    cells.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await elementUpdated(el);

    expect(el.value).toBe("1234");
    expect(detail.value).toBe("1234");
  });

  it("validateInput reports incomplete code error", async () => {
    const el = await fixture<VuOtp>(html`<vu-otp showerrors .length=${4} value="12"></vu-otp>`);
    await elementUpdated(el);
    el.validationActive = true;
    await elementUpdated(el);
    const ok = el.validateInput();
    await elementUpdated(el);
    expect(ok).toBe(false);
    expect(el.validationErrors[0]).toContain("4");
    expect(el.invalid).toBe(true);
  });

  it("uses incompleteMessage when some cells are filled", async () => {
    const el = await fixture<VuOtp>(html`
      <vu-otp showerrors incompletemessage="Finish the code." .length=${4} value="12"></vu-otp>
    `);
    await elementUpdated(el);
    el.validationActive = true;
    el.validateInput();
    await elementUpdated(el);
    expect(el.validationErrors[0]).toBe("Finish the code.");
  });

  it("dispatches vu-invalid when validation runs", async () => {
    const el = await fixture<VuOtp>(html`<vu-otp required showerrors .length=${4}></vu-otp>`);
    await elementUpdated(el);
    let errors: string[] = [];
    el.addEventListener("vu-invalid", ((e: CustomEvent) => {
      errors = (e.detail as { errors?: string[] }).errors ?? [];
    }) as EventListener);
    el.validationActive = true;
    el.validateInput();
    await elementUpdated(el);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("renders slotted hint and wires aria-describedby", async () => {
    const el = await fixture<VuOtp>(html`
      <vu-otp label="x">
        <span slot="hint">Slotted helper</span>
      </vu-otp>
    `);
    await elementUpdated(el);
    const hint = el.shadowRoot?.querySelector('[part="hint"]') as HTMLElement | null;
    const hintSlot = hint?.querySelector('slot[name="hint"]') as HTMLSlotElement | undefined;
    const flat = hintSlot
      ?.assignedNodes({ flatten: true })
      .map((n) => (n as Node).textContent ?? "")
      .join("");
    expect(flat.trim()).toBe("Slotted helper");
    expect(
      el.shadowRoot?.querySelector('[part="cells"]')?.getAttribute("aria-describedby"),
    ).toContain(hint?.id ?? "");
  });

  it("slot error replaces default validation lines when assigned", async () => {
    const el = await fixture<VuOtp>(html`
      <vu-otp label="x" showerrors>
        <em slot="error">Custom error</em>
      </vu-otp>
    `);
    await elementUpdated(el);
    el.validationActive = true;
    el.validationErrors = ["Server message"];
    await elementUpdated(el);
    const slot = el.shadowRoot?.querySelector('slot[name="error"]') as HTMLSlotElement | null;
    const assigned = slot?.assignedNodes({ flatten: true }) ?? [];
    expect(assigned.length).toBeGreaterThan(0);
    expect(assigned.map((n) => (n as HTMLElement).textContent ?? "").join("")).toContain("Custom");
  });

  it("hint and error regions expose aria-live polite", async () => {
    const el = await fixture<VuOtp>(
      html`<vu-otp label="x" hint="h" required showerrors .length=${4}></vu-otp>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="hint"]')?.getAttribute("aria-live")).toBe("polite");
    const cell = el.shadowRoot?.querySelector(".otp-cell") as HTMLInputElement;
    cell?.focus();
    cell?.blur();
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="error-message"]')?.getAttribute("aria-live")).toBe(
      "polite",
    );
  });
});

describe("accessibility", () => {
  it("default otp passes axe", async () => {
    const el = await fixture(html`<vu-otp label="Verification code"></vu-otp>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("disabled otp passes axe", async () => {
    const el = await fixture(html`<vu-otp label="Code" disabled></vu-otp>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("masked outline variant passes axe", async () => {
    const el = await fixture(html`
      <vu-otp label="PIN" variant="outline" masked .length=${4}></vu-otp>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("default in RTL document context", async () => {
    const wrap = await fixture(html`
      <div dir="rtl" lang="en">
        <vu-otp label="Code"></vu-otp>
      </div>
    `);
    await elementUpdated(wrap);
    const el = wrap.querySelector("vu-otp") as VuOtp;
    await expectA11y(el).to.be.accessible();
  });

  describe("keyboard", () => {
    it("ArrowRight moves focus to the next cell", async () => {
      const el = await fixture<VuOtp>(html`<vu-otp .length=${4}></vu-otp>`);
      await elementUpdated(el);
      const cells = el.shadowRoot?.querySelectorAll<HTMLInputElement>(".otp-cell");
      const focusSpy = spyNextFocus(cells, 1);
      cells?.[0]?.focus();
      dispatchKey(cells![0], "ArrowRight");
      expect(focusSpy).toHaveBeenCalled();
    });

    it("ArrowLeft moves focus to the previous cell", async () => {
      const el = await fixture<VuOtp>(html`<vu-otp .length=${4}></vu-otp>`);
      await elementUpdated(el);
      const cells = el.shadowRoot?.querySelectorAll<HTMLInputElement>(".otp-cell");
      const focusSpy = spyNextFocus(cells, 0);
      cells?.[1]?.focus();
      dispatchKey(cells![1], "ArrowLeft");
      expect(focusSpy).toHaveBeenCalled();
    });
  });
});

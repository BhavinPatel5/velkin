/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6✓ 7 N/A 8✓ 9✓ 10 N/A — a11y: default, disabled, readonly, invalid, variants, RTL
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { dispatchKey, spyNextFocus } from "../../../internals/test/keyboard-test-helpers.js";
import { handleSerialPaste } from "../internals/serial-input.js";
import { addSerialSeparators } from "../internals/serial-value.js";
import { VuSerial } from "../serial.js";

describe("vu-serial", () => {
  it("is defined", () => {
    expect(customElements.get("vu-serial")).toBe(VuSerial);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuSerial>(html`<vu-serial></vu-serial>`);
    await elementUpdated(el);
    expect(el.length).toBe(10);
    expect(el.separator).toBe("-");
    expect(el.value).toBe("");
    expect(el.withSeparator).toBe(false);
    expect(el.size).toBe("md");
    const cells = el.shadowRoot?.querySelectorAll('[part="cell"]');
    expect(cells?.length).toBe(10);
    const separators = el.shadowRoot?.querySelectorAll('[part="separator"]');
    expect(separators?.length).toBe(1);
  });

  it("accepts length, separator, value, and withSeparator", async () => {
    const el = await fixture<VuSerial>(
      html`<vu-serial
        .length=${6}
        separator=" "
        .separatorPositions=${[2]}
        .withSeparator=${true}
        value="12 3456"
      ></vu-serial>`,
    );
    await elementUpdated(el);
    expect(el.length).toBe(6);
    expect(el.separator).toBe(" ");
    expect(el.withSeparator).toBe(true);
    expect(el.value).toBe("12 3456");
    expect(el.shadowRoot?.querySelectorAll('[part="cell"]').length).toBe(6);
    expect(el.shadowRoot?.querySelectorAll('[part="separator"]').length).toBe(1);
  });

  it("renders groups split at separatorPositions", async () => {
    const el = await fixture<VuSerial>(
      html`<vu-serial .length=${6} .separatorPositions=${[2, 4]}></vu-serial>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelectorAll('[part="group"]').length).toBe(3);
    expect(el.shadowRoot?.querySelectorAll('[part="separator"]').length).toBe(2);
  });

  it("formats value with separators when withSeparator is true", async () => {
    const el = await fixture<VuSerial>(
      html`<vu-serial .length=${6} .withSeparator=${true} .separatorPositions=${[2]}></vu-serial>`,
    );
    await elementUpdated(el);
    const cells = el.shadowRoot?.querySelectorAll<HTMLInputElement>(".serial-cell");
    ["1", "2", "3", "4", "5", "6"].forEach((digit, index) => {
      const cell = cells![index];
      cell.value = digit;
      cell.dispatchEvent(new InputEvent("input", { bubbles: true, data: digit }));
    });
    await elementUpdated(el);
    expect(el.value).toBe("12-3456");
  });

  it("addSerialSeparators inserts at configured indices", () => {
    expect(addSerialSeparators("123456", "-", [2, 4])).toBe("12-34-56");
  });

  it("renders label when provided", async () => {
    const el = await fixture<VuSerial>(html`<vu-serial label="Product key"></vu-serial>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="text"]')?.textContent?.trim()).toBe("Product key");
  });

  it("dispatches vu-change on commit after typing", async () => {
    const el = await fixture<VuSerial>(html`<vu-serial .length=${4}></vu-serial>`);
    await elementUpdated(el);

    let detail: { value?: string } = {};
    el.addEventListener("vu-change", ((e: CustomEvent) => {
      detail = e.detail ?? {};
    }) as EventListener);

    const cells = el.shadowRoot?.querySelectorAll<HTMLInputElement>(".serial-cell");
    ["1", "2", "3", "4"].forEach((digit, index) => {
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
    const el = await fixture<VuSerial>(html`<vu-serial .length=${3}></vu-serial>`);
    await elementUpdated(el);
    const first = el.shadowRoot?.querySelector(".serial-cell") as HTMLInputElement;
    first.value = "1";
    first.dispatchEvent(new Event("input", { bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe("1");
  });

  it("rejects invalid digit when alphanumeric is false", async () => {
    const el = await fixture<VuSerial>(html`<vu-serial .length=${2}></vu-serial>`);
    await elementUpdated(el);
    const cell = el.shadowRoot?.querySelector(".serial-cell") as HTMLInputElement;
    const ie = new InputEvent("input", { bubbles: true, data: "a" });
    Object.defineProperty(ie, "target", { value: cell });
    cell.value = "a";
    cell.dispatchEvent(ie);
    await elementUpdated(el);
    expect(el.value).toBe("");
  });

  it("focusFirst focuses the first cell", async () => {
    const el = await fixture<VuSerial>(html`<vu-serial></vu-serial>`);
    await elementUpdated(el);
    el.focusFirst();
    const active = el.shadowRoot?.activeElement;
    expect(active?.classList.contains("serial-cell")).toBe(true);
  });

  it("reset restores defaultValue and fires vu-clear", async () => {
    const el = await fixture<VuSerial>(
      html`<vu-serial .defaultValue=${"12"} .length=${4}></vu-serial>`,
    );
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
        <vu-serial name="key" value="1234567890"></vu-serial>
      </form>
    `);
    const el = form.querySelector("vu-serial") as VuSerial;
    await elementUpdated(el);
    expect(new FormData(form).get("key")).toBe("1234567890");
    expect(el.form).toBe(form);
  });

  it("submits value with separators when withSeparator is true", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <vu-serial
          name="key"
          .withSeparator=${true}
          .separatorPositions=${[3]}
          value="123-4567890"
        ></vu-serial>
      </form>
    `);
    await elementUpdated(form.querySelector("vu-serial") as VuSerial);
    expect(new FormData(form).get("key")).toBe("123-4567890");
  });

  it("omits value from FormData when disabled", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <vu-serial name="key" value="1234567890" disabled></vu-serial>
      </form>
    `);
    await elementUpdated(form.querySelector("vu-serial") as VuSerial);
    expect(new FormData(form).get("key")).toBeNull();
  });

  it("form.reset() restores defaultValue", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <vu-serial name="key" .defaultValue=${"12"} .length=${4}></vu-serial>
      </form>
    `);
    const el = form.querySelector("vu-serial") as VuSerial;
    await elementUpdated(el);
    el.value = "9999";
    await elementUpdated(el);
    form.reset();
    await elementUpdated(el);
    expect(el.value).toBe("12");
  });

  it("required and showErrors surfaces error after blur", async () => {
    const el = await fixture<VuSerial>(
      html`<vu-serial required showerrors label="Key" .length=${4}></vu-serial>`,
    );
    await elementUpdated(el);
    const cell = el.shadowRoot?.querySelector(".serial-cell") as HTMLInputElement;
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
    const el = await fixture<VuSerial>(
      html`<vu-serial label="Key" hint="Found on the product card."></vu-serial>`,
    );
    await elementUpdated(el);
    const hint = el.shadowRoot?.querySelector('[part="hint"]') as HTMLElement | null;
    expect(hint?.textContent?.trim()).toBe("Found on the product card.");
    expect(
      el.shadowRoot?.querySelector('[part="cells"]')?.getAttribute("aria-describedby"),
    ).toContain(hint?.id ?? "");
  });

  it("does not toggle when readonly", async () => {
    const el = await fixture<VuSerial>(
      html`<vu-serial readonly value="1" .length=${2}></vu-serial>`,
    );
    await elementUpdated(el);
    const cell = el.shadowRoot?.querySelector(".serial-cell") as HTMLInputElement;
    expect(cell.readOnly).toBe(true);
  });

  it("reflects variant, size, and pill", async () => {
    const el = await fixture<VuSerial>(
      html`<vu-serial variant="outline" size="sm" radius="full"></vu-serial>`,
    );
    await elementUpdated(el);
    expect(el.variant).toBe("outline");
    expect(el.size).toBe("sm");
    expect(el.radius).toBe("full");
    expect(el.getAttribute("variant")).toBe("outline");
  });

  it("renders slotted label and hides string label part", async () => {
    const el = await fixture<VuSerial>(html`
      <vu-serial label="Ignored">
        <span slot="label">Slotted <em>rich</em> label</span>
      </vu-serial>
    `);
    await elementUpdated(el);
    const slot = el.shadowRoot?.querySelector('slot[name="label"]') as HTMLSlotElement | undefined;
    const nodes = slot?.assignedNodes({ flatten: true }) ?? [];
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes.map((n) => (n as Node).textContent ?? "").join("")).toContain("Slotted");
  });

  it("reflects compact on host", async () => {
    const el = await fixture<VuSerial>(html`<vu-serial compact label="Key"></vu-serial>`);
    await elementUpdated(el);
    expect(el.compact).toBe(true);
    expect(el.hasAttribute("compact")).toBe(true);
  });

  it("focus adds shake class to cells row", async () => {
    const el = await fixture<VuSerial>(html`<vu-serial></vu-serial>`);
    await elementUpdated(el);
    el.focus();
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector(".serial-cells")?.classList.contains("shake")).toBe(true);
  });

  it("accepts alphanumeric and masked", async () => {
    const el = await fixture<VuSerial>(html`<vu-serial alphanumeric masked></vu-serial>`);
    await elementUpdated(el);
    expect(el.alphanumeric).toBe(true);
    expect(el.masked).toBe(true);
    const cell = el.shadowRoot?.querySelector(".serial-cell") as HTMLInputElement;
    expect(cell.type).toBe("password");
  });

  it("paste fills all cells and commits value", async () => {
    const el = await fixture<VuSerial>(html`<vu-serial .length=${4}></vu-serial>`);
    await elementUpdated(el);

    let detail: { value?: string } = {};
    el.addEventListener("vu-change", ((e: CustomEvent) => {
      detail = e.detail ?? {};
    }) as EventListener);

    const pasteEvent = {
      preventDefault: () => {},
      clipboardData: { getData: () => "12-34" },
    } as unknown as ClipboardEvent;
    handleSerialPaste(el, pasteEvent);
    await elementUpdated(el);
    const cell = el.shadowRoot?.querySelector(".serial-cell") as HTMLInputElement;
    cell.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await elementUpdated(el);

    expect(el.value).toBe("1234");
    expect(detail.value).toBe("1234");
  });

  it("validateInput reports incomplete code error", async () => {
    const el = await fixture<VuSerial>(
      html`<vu-serial showerrors .length=${4} value="12"></vu-serial>`,
    );
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
    const el = await fixture<VuSerial>(html`
      <vu-serial
        showerrors
        incompletemessage="Finish the serial."
        .length=${4}
        value="12"
      ></vu-serial>
    `);
    await elementUpdated(el);
    el.validationActive = true;
    el.validateInput();
    await elementUpdated(el);
    expect(el.validationErrors[0]).toBe("Finish the serial.");
  });

  it("dispatches vu-invalid when validation runs", async () => {
    const el = await fixture<VuSerial>(
      html`<vu-serial required showerrors .length=${4}></vu-serial>`,
    );
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

  it("sets aria-label on group when no label or label slot", async () => {
    const el = await fixture<VuSerial>(html`<vu-serial arialabel="Enter product key"></vu-serial>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="cells"]')?.getAttribute("aria-label")).toBe(
      "Enter product key",
    );
  });

  it("respects disabled on cells", async () => {
    const el = await fixture<VuSerial>(html`<vu-serial disabled></vu-serial>`);
    await elementUpdated(el);
    expect(el.disabled).toBe(true);
    const cell = el.shadowRoot?.querySelector(".serial-cell") as HTMLInputElement;
    expect(cell?.disabled).toBe(true);
  });

  it("renders slotted hint and wires aria-describedby", async () => {
    const el = await fixture<VuSerial>(html`
      <vu-serial label="Key">
        <span slot="hint">Slotted helper</span>
      </vu-serial>
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
    const el = await fixture<VuSerial>(html`
      <vu-serial label="Key" showerrors>
        <em slot="error">Custom error</em>
      </vu-serial>
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
    const el = await fixture<VuSerial>(
      html`<vu-serial label="Key" hint="h" required showerrors .length=${4}></vu-serial>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="hint"]')?.getAttribute("aria-live")).toBe("polite");
    const cell = el.shadowRoot?.querySelector(".serial-cell") as HTMLInputElement;
    cell?.focus();
    cell?.blur();
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="error-message"]')?.getAttribute("aria-live")).toBe(
      "polite",
    );
  });
});

describe("accessibility", () => {
  it("default serial passes axe", async () => {
    const el = await fixture(html`<vu-serial label="Product key"></vu-serial>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("with separators passes axe", async () => {
    const el = await fixture(html`
      <vu-serial label="Key" .separatorPositions=${[3, 6]}></vu-serial>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("disabled serial passes axe", async () => {
    const el = await fixture(html`<vu-serial label="Key" disabled></vu-serial>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("readonly serial passes axe", async () => {
    const el = await fixture(html`<vu-serial label="Key" readonly value="1234567890"></vu-serial>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("required invalid serial passes axe", async () => {
    const el = await fixture(html`
      <vu-serial label="Key" required showerrors .length=${4}></vu-serial>
    `);
    await elementUpdated(el);
    const cell = el.shadowRoot?.querySelector(".serial-cell") as HTMLInputElement;
    cell?.focus();
    cell?.blur();
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("masked outline variant passes axe", async () => {
    const el = await fixture(html`
      <vu-serial label="Key" variant="outline" masked .length=${4}></vu-serial>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("underline variant passes axe", async () => {
    const el = await fixture(html`
      <vu-serial label="Key" variant="underline" .length=${4}></vu-serial>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("default in RTL document context", async () => {
    const wrap = await fixture(html`
      <div dir="rtl" lang="en">
        <vu-serial label="Key"></vu-serial>
      </div>
    `);
    await elementUpdated(wrap);
    const el = wrap.querySelector("vu-serial") as VuSerial;
    await expectA11y(el).to.be.accessible();
  });

  describe("keyboard", () => {
    it("ArrowRight moves focus to the next cell", async () => {
      const el = await fixture<VuSerial>(html`<vu-serial .length=${4}></vu-serial>`);
      await elementUpdated(el);
      const cells = el.shadowRoot?.querySelectorAll<HTMLInputElement>('[part="cell"]');
      const focusSpy = spyNextFocus(cells, 1);
      cells?.[0]?.focus();
      dispatchKey(cells![0], "ArrowRight");
      expect(focusSpy).toHaveBeenCalled();
    });

    it("ArrowLeft moves focus to the previous cell", async () => {
      const el = await fixture<VuSerial>(html`<vu-serial .length=${4}></vu-serial>`);
      await elementUpdated(el);
      const cells = el.shadowRoot?.querySelectorAll<HTMLInputElement>('[part="cell"]');
      const focusSpy = spyNextFocus(cells, 0);
      cells?.[1]?.focus();
      dispatchKey(cells![1], "ArrowLeft");
      expect(focusSpy).toHaveBeenCalled();
    });
  });
});

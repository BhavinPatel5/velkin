/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3 N/A 4✓ 5✓ 6✓ 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect, vi } from "vitest";
import { VU_THEME_SWITCHER_CHANGE_EVENT, VuThemeSwitcher } from "../theme-switcher.js";
import { VuThemeProvider } from "../../theme-provider/theme-provider.js";
import { themeSwitcherChangeDetail } from "../internals/theme-switcher.logic.js";
import "../../button/button.js";
import "../../tab/tab.js";
import "../../icon/icon.js";

describe("vu-theme-switcher", () => {
  it("is defined", () => {
    expect(customElements.get("vu-theme-switcher")).toBe(VuThemeSwitcher);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuThemeSwitcher>(html`<vu-theme-switcher></vu-theme-switcher>`);
    await elementUpdated(el);
    expect(el.type).toBe("button");
    expect(el.radius).toBe("md");
    expect(el.size).toBe("md");
    expect(el.variant).toBe("ghost");
    expect(el.color).toBe("default");
    const btn = el.shadowRoot?.querySelector('[part="button"]') as HTMLElement;
    expect(btn?.querySelector("vu-icon[part=icon]")).toBeTruthy();
    expect(btn?.hasAttribute("disabled")).toBe(false);
  });

  it("lets slot=icon replace the cycling button icon", async () => {
    const el = await fixture<VuThemeSwitcher>(html`
      <vu-theme-switcher>
        <span slot="icon">X</span>
      </vu-theme-switcher>
    `);
    await elementUpdated(el);
    const slot = el.shadowRoot?.querySelector('slot[name="icon"]') as HTMLSlotElement | null;
    expect(slot).toBeTruthy();
    expect(slot?.assignedElements().some((node) => node.getAttribute("slot") === "icon")).toBe(
      true,
    );
  });

  it("accepts type, pill, size, disabled, variant, and custom icons", async () => {
    const el = await fixture<VuThemeSwitcher>(
      html`<vu-theme-switcher
        type="switch"
        radius="full"
        size="lg"
        disabled
        variant="outline"
        darkIcon="custom:dark"
        lightIcon="custom:light"
        systemIcon="custom:system"
      ></vu-theme-switcher>`,
    );
    await elementUpdated(el);
    expect(el.type).toBe("switch");
    expect(el.radius).toBe("full");
    expect(el.size).toBe("lg");
    expect(el.disabled).toBe(true);
    expect(el.variant).toBe("outline");
    expect(el.darkIcon).toBe("custom:dark");
    expect(el.lightIcon).toBe("custom:light");
    expect(el.systemIcon).toBe("custom:system");
  });

  it("cycles preference via provider context in button mode", async () => {
    const provider = await fixture<VuThemeProvider>(
      html`<vu-theme-provider preference="light" .persist=${false} .broadcast=${false}>
        <vu-theme-switcher></vu-theme-switcher>
      </vu-theme-provider>`,
    );
    await elementUpdated(provider);
    const el = provider.querySelector("vu-theme-switcher") as VuThemeSwitcher;
    const handler = vi.fn();
    el.addEventListener(VU_THEME_SWITCHER_CHANGE_EVENT, handler);

    const btn = el.shadowRoot?.querySelector('[part="button"]') as HTMLElement | null;
    (btn?.shadowRoot?.querySelector('[part="base"]') as HTMLButtonElement | null)?.click();
    await elementUpdated(provider);

    expect(provider.preference).toBe("system");
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]?.[0].detail).toEqual(themeSwitcherChangeDetail("system"));
  });

  it("toggleTheme cycles preference and emits vu-theme", async () => {
    const provider = await fixture<VuThemeProvider>(
      html`<vu-theme-provider preference="light" .persist=${false} .broadcast=${false}>
        <vu-theme-switcher></vu-theme-switcher>
      </vu-theme-provider>`,
    );
    await elementUpdated(provider);
    const el = provider.querySelector("vu-theme-switcher") as VuThemeSwitcher;
    const handler = vi.fn();
    el.addEventListener(VU_THEME_SWITCHER_CHANGE_EVENT, handler);

    el.toggleTheme();
    await elementUpdated(provider);

    expect(provider.preference).toBe("system");
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("updates preference in switch mode", async () => {
    const provider = await fixture<VuThemeProvider>(
      html`<vu-theme-provider preference="light" .persist=${false} .broadcast=${false}>
        <vu-theme-switcher type="switch"></vu-theme-switcher>
      </vu-theme-provider>`,
    );
    await elementUpdated(provider);
    const el = provider.querySelector("vu-theme-switcher") as VuThemeSwitcher;
    await elementUpdated(el);
    const tab = el.shadowRoot?.querySelector("vu-tab");
    expect(tab).toBeTruthy();
    await elementUpdated(tab!);
    tab!.shadowRoot?.querySelectorAll<HTMLButtonElement>(".btn")[2]?.click();
    await elementUpdated(provider);

    expect(provider.preference).toBe("dark");
  });

  describe("accessibility", () => {
    it("button mode with provider", async () => {
      const provider = await fixture<VuThemeProvider>(
        html`<vu-theme-provider preference="light" .persist=${false} .broadcast=${false}>
          <vu-theme-switcher></vu-theme-switcher>
        </vu-theme-provider>`,
      );
      await elementUpdated(provider);
      const el = provider.querySelector("vu-theme-switcher") as VuThemeSwitcher;
      await expectA11y(el).to.be.accessible();
    });

    it("switch mode with provider", async () => {
      const provider = await fixture<VuThemeProvider>(
        html`<vu-theme-provider preference="light" .persist=${false} .broadcast=${false}>
          <vu-theme-switcher type="switch" .iconOnly=${false}></vu-theme-switcher>
        </vu-theme-provider>`,
      );
      await elementUpdated(provider);
      const el = provider.querySelector("vu-theme-switcher") as VuThemeSwitcher;
      await expectA11y(el).to.be.accessible();
    });
  });
});

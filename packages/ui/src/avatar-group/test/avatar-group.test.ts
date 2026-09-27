/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuAvatarGroup } from "../avatar-group.js";
import "../../avatar/avatar.js";

describe("vu-avatar-group", () => {
  it("is defined", () => {
    expect(customElements.get("vu-avatar-group")).toBe(VuAvatarGroup);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuAvatarGroup>(html`<vu-avatar-group></vu-avatar-group>`);
    await elementUpdated(el);

    expect(el.max).toBe(0);
    expect(el.total).toBe(0);
    expect(el.size).toBe("md");
    expect(el.radius).toBe("full");
    expect(el.spacing).toBe("md");
    expect(el.bordered).toBe(true);
    expect(el.disabled).toBe(false);

    expect(el.shadowRoot?.querySelector('[part="group"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="overflow"]')).toBeFalsy();
  });

  it("reflects size, radius, spacing, bordered, disabled as attributes", async () => {
    const el = await fixture<VuAvatarGroup>(html`
      <vu-avatar-group size="lg" radius="md" spacing="lg" disabled></vu-avatar-group>
    `);
    await elementUpdated(el);
    expect(el.getAttribute("size")).toBe("lg");
    expect(el.getAttribute("radius")).toBe("md");
    expect(el.getAttribute("spacing")).toBe("lg");
    expect(el.hasAttribute("bordered")).toBe(true);
    expect(el.hasAttribute("disabled")).toBe(true);
    expect(el.getAttribute("aria-disabled")).toBe("true");
    expect(el.shadowRoot?.querySelector('[part="group"]')?.getAttribute("role")).toBe("group");
  });

  it("reflects all spacing tokens", async () => {
    for (const spacing of ["sm", "md", "lg"] as const) {
      const el = await fixture<VuAvatarGroup>(
        html`<vu-avatar-group spacing=${spacing}></vu-avatar-group>`,
      );
      await elementUpdated(el);
      expect(el.getAttribute("spacing")).toBe(spacing);
    }
  });

  it("clears disabled forwarding when the group is re-enabled", async () => {
    const el = await fixture<VuAvatarGroup>(html`
      <vu-avatar-group disabled>
        <vu-avatar name="A"></vu-avatar>
        <vu-avatar name="B"></vu-avatar>
      </vu-avatar-group>
    `);
    await elementUpdated(el);
    el.disabled = false;
    await elementUpdated(el);
    expect(el.hasAttribute("aria-disabled")).toBe(false);
    el.querySelectorAll("vu-avatar").forEach((av) => {
      expect(av.hasAttribute("disabled")).toBe(false);
    });
  });

  it("forwards size to every avatar child", async () => {
    const el = await fixture<VuAvatarGroup>(html`
      <vu-avatar-group size="lg">
        <vu-avatar name="A"></vu-avatar>
        <vu-avatar name="B"></vu-avatar>
        <vu-avatar name="C"></vu-avatar>
      </vu-avatar-group>
    `);
    await elementUpdated(el);
    el.querySelectorAll("vu-avatar").forEach((av) => {
      expect(av.getAttribute("size")).toBe("lg");
    });
  });

  it("forwards radius to every avatar child", async () => {
    const el = await fixture<VuAvatarGroup>(html`
      <vu-avatar-group radius="sm">
        <vu-avatar name="A"></vu-avatar>
        <vu-avatar name="B"></vu-avatar>
      </vu-avatar-group>
    `);
    await elementUpdated(el);
    el.querySelectorAll("vu-avatar").forEach((av) => {
      expect(av.getAttribute("radius")).toBe("sm");
    });
  });

  it("forwards bordered as attribute (default true)", async () => {
    const el = await fixture<VuAvatarGroup>(html`
      <vu-avatar-group>
        <vu-avatar name="A"></vu-avatar>
        <vu-avatar name="B"></vu-avatar>
      </vu-avatar-group>
    `);
    await elementUpdated(el);
    el.querySelectorAll("vu-avatar").forEach((av) => {
      expect(av.hasAttribute("bordered")).toBe(true);
    });
  });

  it("removes bordered when group's bordered is false", async () => {
    const el = await fixture<VuAvatarGroup>(html`
      <vu-avatar-group .bordered=${false}>
        <vu-avatar name="A" bordered></vu-avatar>
      </vu-avatar-group>
    `);
    await elementUpdated(el);
    const av = el.querySelector("vu-avatar")!;
    expect(av.hasAttribute("bordered")).toBe(false);
  });

  it("forwards disabled to every avatar child", async () => {
    const el = await fixture<VuAvatarGroup>(html`
      <vu-avatar-group disabled>
        <vu-avatar name="A"></vu-avatar>
        <vu-avatar name="B"></vu-avatar>
      </vu-avatar-group>
    `);
    await elementUpdated(el);
    el.querySelectorAll("vu-avatar").forEach((av) => {
      expect(av.hasAttribute("disabled")).toBe(true);
    });
  });

  it("assigns ascending z-index so later avatars and overflow sit on top", async () => {
    const el = await fixture<VuAvatarGroup>(html`
      <vu-avatar-group max="2">
        <vu-avatar name="A"></vu-avatar>
        <vu-avatar name="B"></vu-avatar>
        <vu-avatar name="C"></vu-avatar>
      </vu-avatar-group>
    `);
    await elementUpdated(el);
    const avatars = Array.from(el.querySelectorAll(":scope > vu-avatar"));
    const z = avatars.filter((a) => !a.hasAttribute("hidden")).map((a) => Number(a.style.zIndex));
    expect(z[0]).toBe(1);
    expect(z[1]).toBe(2);
    expect(el.style.getPropertyValue("--avatar-group-overflow-z").trim()).toBe("3");
    const overflow = el.shadowRoot?.querySelector('[part="overflow"]') as HTMLElement;
    expect(overflow.style.zIndex).toBe("3");
  });

  it("hides children past 'max' and renders +N overflow tile", async () => {
    const el = await fixture<VuAvatarGroup>(html`
      <vu-avatar-group max="2">
        <vu-avatar name="A"></vu-avatar>
        <vu-avatar name="B"></vu-avatar>
        <vu-avatar name="C"></vu-avatar>
        <vu-avatar name="D"></vu-avatar>
      </vu-avatar-group>
    `);
    await elementUpdated(el);

    const avatars = Array.from(el.querySelectorAll("vu-avatar"));
    expect(avatars[0].hasAttribute("hidden")).toBe(false);
    expect(avatars[1].hasAttribute("hidden")).toBe(false);
    expect(avatars[2].hasAttribute("hidden")).toBe(true);
    expect(avatars[3].hasAttribute("hidden")).toBe(true);

    const overflow = el.shadowRoot?.querySelector('[part="overflow"]');
    expect(overflow).toBeTruthy();
    expect(overflow?.textContent?.trim()).toBe("+2");
  });

  it("does not render the overflow tile when child count fits within max", async () => {
    const el = await fixture<VuAvatarGroup>(html`
      <vu-avatar-group max="5">
        <vu-avatar name="A"></vu-avatar>
        <vu-avatar name="B"></vu-avatar>
      </vu-avatar-group>
    `);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="overflow"]')).toBeFalsy();
  });

  it("uses explicit total when set, even though slot has fewer children", async () => {
    const el = await fixture<VuAvatarGroup>(html`
      <vu-avatar-group max="3" total="42">
        <vu-avatar name="A"></vu-avatar>
        <vu-avatar name="B"></vu-avatar>
        <vu-avatar name="C"></vu-avatar>
      </vu-avatar-group>
    `);
    await elementUpdated(el);
    const overflow = el.shadowRoot?.querySelector('[part="overflow"]');
    expect(overflow).toBeTruthy();
    expect(overflow?.textContent?.trim()).toBe("+39");
  });

  it("shows the full multi-digit overflow count (not truncated initials)", async () => {
    const el = await fixture<VuAvatarGroup>(html`
      <vu-avatar-group max="1" total="100">
        <vu-avatar name="A"></vu-avatar>
      </vu-avatar-group>
    `);
    await elementUpdated(el);
    const overflow = el.shadowRoot?.querySelector('[part="overflow"]') as HTMLElement;
    expect(overflow?.textContent?.trim()).toBe("+99");
    expect(overflow?.hasAttribute("name")).toBe(false);
    const slot = overflow?.shadowRoot?.querySelector(
      '[part="fallback"] slot',
    ) as HTMLSlotElement | null;
    const assigned = slot?.assignedNodes({ flatten: true }) ?? [];
    expect(assigned.map((n) => n.textContent ?? "").join("").trim()).toBe("+99");
  });

  it("re-syncs when 'max' changes", async () => {
    const el = await fixture<VuAvatarGroup>(html`
      <vu-avatar-group>
        <vu-avatar name="A"></vu-avatar>
        <vu-avatar name="B"></vu-avatar>
        <vu-avatar name="C"></vu-avatar>
      </vu-avatar-group>
    `);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="overflow"]')).toBeFalsy();

    el.max = 1;
    await elementUpdated(el);

    const overflow = el.shadowRoot?.querySelector('[part="overflow"]');
    expect(overflow).toBeTruthy();
    expect(overflow?.textContent?.trim()).toBe("+2");
    const avatars = Array.from(el.querySelectorAll("vu-avatar"));
    expect(avatars[0].hasAttribute("hidden")).toBe(false);
    expect(avatars[1].hasAttribute("hidden")).toBe(true);
    expect(avatars[2].hasAttribute("hidden")).toBe(true);
  });

  it("re-syncs when 'size' changes", async () => {
    const el = await fixture<VuAvatarGroup>(html`
      <vu-avatar-group size="md">
        <vu-avatar name="A"></vu-avatar>
      </vu-avatar-group>
    `);
    await elementUpdated(el);
    expect(el.querySelector("vu-avatar")?.getAttribute("size")).toBe("md");

    el.size = "lg";
    await elementUpdated(el);
    expect(el.querySelector("vu-avatar")?.getAttribute("size")).toBe("lg");
  });

  it("ignores non-avatar children for forwarding and overflow math", async () => {
    const el = await fixture<VuAvatarGroup>(html`
      <vu-avatar-group max="2">
        <vu-avatar name="A"></vu-avatar>
        <span>not an avatar</span>
        <vu-avatar name="B"></vu-avatar>
        <vu-avatar name="C"></vu-avatar>
      </vu-avatar-group>
    `);
    await elementUpdated(el);
    const overflow = el.shadowRoot?.querySelector('[part="overflow"]');
    expect(overflow?.textContent?.trim()).toBe("+1");
  });

  it("respects a custom overflow renderer slotted via slot='overflow'", async () => {
    const el = await fixture<VuAvatarGroup>(html`
      <vu-avatar-group max="1">
        <vu-avatar name="A"></vu-avatar>
        <vu-avatar name="B"></vu-avatar>
        <vu-avatar name="C"></vu-avatar>
        <span slot="overflow" class="custom-overflow">+2 more</span>
      </vu-avatar-group>
    `);
    await elementUpdated(el);
    expect(el.querySelector(".custom-overflow")?.textContent).toBe("+2 more");
    expect(el.shadowRoot?.querySelector('[part="overflow"]')).toBeFalsy();
  });

  it("re-syncs after a child is appended at runtime", async () => {
    const el = await fixture<VuAvatarGroup>(html`
      <vu-avatar-group max="2">
        <vu-avatar name="A"></vu-avatar>
        <vu-avatar name="B"></vu-avatar>
      </vu-avatar-group>
    `);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="overflow"]')).toBeFalsy();

    const av = document.createElement("vu-avatar");
    av.setAttribute("name", "C");
    el.appendChild(av);
    await elementUpdated(el);

    const overflow = el.shadowRoot?.querySelector('[part="overflow"]');
    expect(overflow).toBeTruthy();
    expect(overflow?.textContent?.trim()).toBe("+1");
  });
});

describe("accessibility", () => {
  it("avatar group passes axe", async () => {
    const el = await fixture(html`
      <vu-avatar-group>
        <vu-avatar name="A"></vu-avatar>
        <vu-avatar name="B"></vu-avatar>
      </vu-avatar-group>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("disabled avatar group passes axe", async () => {
    const el = await fixture(html`
      <vu-avatar-group disabled>
        <vu-avatar name="A"></vu-avatar>
        <vu-avatar name="B"></vu-avatar>
      </vu-avatar-group>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});

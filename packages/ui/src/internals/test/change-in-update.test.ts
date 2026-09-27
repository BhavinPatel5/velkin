import { LitElement } from "lit";
import { expect, it, describe } from "vitest";
import {
  buildAllPropHotPaths,
  buildHeuristicHotPaths,
  expectHotPathsNoChangeInUpdate,
  expectMountNoChangeInUpdate,
  expectMountTreeNoChangeInUpdate,
  expectNoChangeInUpdate,
  expectTreeNoChangeInUpdate,
  listPublicReactiveProps,
} from "./change-in-update.js";

/** Minimal hosts use `static properties` so Vitest class fields do not shadow Lit accessors. */
class BadHost extends LitElement {
  static properties = {
    value: { type: String },
    _mirror: { state: true },
  };
  declare value: string;
  declare _mirror: string;

  constructor() {
    super();
    this.value = "";
    this._mirror = "";
  }

  override updated(changed: Map<PropertyKey, unknown>): void {
    if (changed.has("value")) this._mirror = this.value;
  }
}

class GoodHost extends LitElement {
  static properties = {
    value: { type: String },
    open: { type: Boolean },
    _mirror: { state: true },
  };
  declare value: string;
  declare open: boolean;
  declare _mirror: string;

  constructor() {
    super();
    this.value = "";
    this.open = false;
    this._mirror = "";
  }

  override willUpdate(changed: Map<PropertyKey, unknown>): void {
    if (changed.has("value")) this._mirror = this.value;
  }

  show(): void {
    this.open = true;
  }

  hide(): void {
    this.open = false;
  }
}

customElements.define("vu-test-ciu-bad", BadHost);
customElements.define("vu-test-ciu-good", GoodHost);

describe("change-in-update helpers", () => {
  it("passes when derived state is set in willUpdate", async () => {
    const el = document.createElement("vu-test-ciu-good") as GoodHost;
    el.value = "a";
    await expectMountNoChangeInUpdate(el);
    await expectNoChangeInUpdate(el, () => {
      el.value = "b";
    });
    el.remove();
  });

  // Run before other BadHost cases — Lit only console.warns change-in-update once per document.
  it("detects nested child change-in-update via tree helper", async () => {
    const wrap = document.createElement("div");
    const child = document.createElement("vu-test-ciu-bad") as BadHost;
    wrap.appendChild(child);
    document.body.appendChild(wrap);
    await child.updateComplete;

    await expect(
      expectTreeNoChangeInUpdate(wrap, () => {
        child.value = "nested";
      }),
    ).rejects.toThrow(/Nested change-in-update|scheduled an update/);

    wrap.remove();
  });

  it("fails when derived state is set in updated", async () => {
    const el = document.createElement("vu-test-ciu-bad") as BadHost;
    el.value = "a";
    await expect(expectMountNoChangeInUpdate(el)).rejects.toThrow(
      /follow-up update|updateComplete was false/,
    );
    el.remove();
  });

  it("listPublicReactiveProps excludes state:true fields", () => {
    const el = document.createElement("vu-test-ciu-good") as GoodHost;
    const names = listPublicReactiveProps(el);
    expect(names).toContain("value");
    expect(names).toContain("open");
    expect(names).not.toContain("_mirror");
  });

  it("buildAllPropHotPaths covers public props and restores booleans", async () => {
    const el = document.createElement("vu-test-ciu-good") as GoodHost;
    document.body.appendChild(el);
    await el.updateComplete;

    const names = buildAllPropHotPaths(el).map((a) => a.name);
    expect(names).toContain("prop:open");
    expect(names).toContain("prop:value");
    expect(names).not.toContain("prop:_mirror");

    await expectHotPathsNoChangeInUpdate(el, el, { allProps: true });
    expect(el.open).toBe(false);
    el.remove();
  });

  it("heuristic hot paths cover open/value without warnings on a good host", async () => {
    const el = document.createElement("vu-test-ciu-good") as GoodHost;
    document.body.appendChild(el);
    await el.updateComplete;

    const names = buildHeuristicHotPaths(el).map((a) => a.name);
    expect(names).toContain("prop:open");
    expect(names).toContain("prop:value");
    expect(names).toContain("method:show");

    await expectHotPathsNoChangeInUpdate(el, el, { allProps: false });
    el.remove();
  });

  it("expectMountTreeNoChangeInUpdate fails on bad first paint", async () => {
    const el = document.createElement("vu-test-ciu-bad") as BadHost;
    el.value = "seed";
    await expect(expectMountTreeNoChangeInUpdate(el)).rejects.toThrow(
      /change-in-update|follow-up/,
    );
    el.remove();
  });
});

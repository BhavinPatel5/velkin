/**
 * Coverage: merge + resolve helpers for component presets.
 */
import { expect, describe, it } from "vitest";
import {
  applyPresetLayer,
  camelToKebab,
  captureBuiltInPropSnapshot,
  captureInitialUserAttributes,
  findNearestPresetsConfig,
  getPresetLayer,
  isVuCompositeInternal,
  isUserSetProp,
  markUserSetProp,
  mergePresetsConfig,
  resolveComponentProps,
  type ComponentPresetsConfig,
} from "./component-presets.js";

/** Minimal host for attribute snapshot tests (no DOM package required). */
function mockHost(initialAttrs: string[] = []): HTMLElement {
  const attrs = new Set(initialAttrs);
  return {
    getAttributeNames: () => [...attrs],
    hasAttribute: (name: string) => attrs.has(name),
    setAttribute: (name: string) => {
      attrs.add(name);
    },
  } as unknown as HTMLElement;
}

describe("component-presets helpers", () => {
  it("camelToKebab maps iconL and statusColor", () => {
    expect(camelToKebab("iconL")).toBe("icon-l");
    expect(camelToKebab("statusColor")).toBe("status-color");
    expect(camelToKebab("variant")).toBe("variant");
  });

  it("mergePresetsConfig deep-merges defaults and named presets", () => {
    const parent: ComponentPresetsConfig = {
      defaults: { button: { variant: "shadow", size: "sm" } },
      presets: {
        button: { cancel: { color: "dark" } },
      },
    };
    const child: ComponentPresetsConfig = {
      defaults: { button: { size: "xs" }, chip: { size: "sm" } },
      presets: {
        button: {
          cancel: { size: "md" },
          toolbar: { variant: "shadow", color: "default" },
        },
      },
    };
    const merged = mergePresetsConfig(parent, child);
    // merge normalizes keys to tag names (`vu-button`)
    expect(merged.defaults?.["vu-button"]).toEqual({
      variant: "shadow",
      size: "xs",
    });
    expect(merged.defaults?.["vu-chip"]).toEqual({ size: "sm" });
    expect(merged.presets?.["vu-button"]?.cancel).toEqual({
      color: "dark",
      size: "md",
    });
    expect(merged.presets?.["vu-button"]?.toolbar).toEqual({
      variant: "shadow",
      color: "default",
    });
  });

  it("getPresetLayer resolves short aliases and tag names to the same bag", () => {
    const config: ComponentPresetsConfig = {
      defaults: { "vu-button": { size: "sm" } },
      presets: { button: { cancel: { color: "danger" } } },
    };
    expect(getPresetLayer(config, "vu-button", "cancel")).toEqual({
      size: "sm",
      color: "danger",
    });
    expect(getPresetLayer(config, "button", "cancel")).toEqual({
      size: "sm",
      color: "danger",
    });
  });

  it("isUserSetProp uses initial attribute snapshot", () => {
    const el = mockHost(["status-color"]);
    captureInitialUserAttributes(el);
    el.setAttribute("variant", "solid"); // late reflect — not user-owned
    expect(isUserSetProp(el, "statusColor")).toBe(true);
    expect(isUserSetProp(el, "variant")).toBe(false);
  });

  it("resolveComponentProps applies defaults and named preset; attributes win", () => {
    const host = mockHost();
    const config: ComponentPresetsConfig = {
      defaults: { button: { variant: "shadow", size: "sm", color: "primary" } },
      presets: {
        button: {
          cancel: { variant: "shadow", color: "dark", size: "md" },
        },
      },
    };

    const withDefaults = resolveComponentProps({
      host,
      componentKey: "button",
      config,
      values: { variant: "solid", size: "md", color: "primary" },
      keys: ["variant", "size", "color"],
    });
    expect(withDefaults).toEqual({
      variant: "shadow",
      size: "sm",
      color: "primary",
    });

    const withNamed = resolveComponentProps({
      host,
      componentKey: "button",
      presetName: "cancel",
      config,
      values: { variant: "solid", size: "md", color: "primary" },
      keys: ["variant", "size", "color"],
    });
    expect(withNamed).toEqual({
      variant: "shadow",
      size: "md",
      color: "dark",
    });

    const hostWithAttrs = mockHost(["variant", "color"]);
    captureInitialUserAttributes(hostWithAttrs);
    const withAttrs = resolveComponentProps({
      host: hostWithAttrs,
      componentKey: "button",
      presetName: "cancel",
      config,
      values: { variant: "solid", size: "md", color: "warning" },
      keys: ["variant", "size", "color"],
    });
    expect(withAttrs).toEqual({
      variant: "solid",
      size: "md",
      color: "warning",
    });
  });

  it("findNearestPresetsConfig reads ancestor presets via parentElement", () => {
    const outer = mockHost() as HTMLElement & {
      localName: string;
      presets: ComponentPresetsConfig;
      parentElement: HTMLElement | null;
      appendChild?: (c: HTMLElement) => void;
    };
    const inner = mockHost() as typeof outer;
    const host = mockHost() as typeof outer;

    Object.defineProperty(outer, "localName", { value: "vu-config-provider" });
    Object.defineProperty(inner, "localName", { value: "vu-config-provider" });
    Object.defineProperty(host, "localName", { value: "div" });
    outer.presets = { defaults: { button: { variant: "shadow", size: "sm" } } };
    inner.presets = { defaults: { button: { size: "xs" } } };

    Object.defineProperty(host, "parentElement", { get: () => inner });
    Object.defineProperty(inner, "parentElement", { get: () => outer });
    Object.defineProperty(outer, "parentElement", { get: () => null });

    expect(findNearestPresetsConfig(host)?.defaults?.["vu-button"]).toEqual({
      variant: "shadow",
      size: "xs",
    });
  });

  it("isVuCompositeInternal is true only under vu-* shadow roots", () => {
    const light = mockHost() as HTMLElement & {
      getRootNode: () => Document | ShadowRoot;
    };
    Object.defineProperty(light, "getRootNode", {
      value: () => ({ nodeType: 9 }),
    });
    expect(isVuCompositeInternal(light)).toBe(false);

    if (typeof document === "undefined" || typeof ShadowRoot === "undefined") {
      return;
    }
    const composite = document.createElement("vu-fake-table");
    const shadow = composite.attachShadow({ mode: "open" });
    const internal = document.createElement("div");
    shadow.appendChild(internal);
    expect(isVuCompositeInternal(internal)).toBe(true);

    document.body.appendChild(composite);
    const slotted = document.createElement("div");
    composite.appendChild(slotted);
    expect(isVuCompositeInternal(slotted)).toBe(false);
    composite.remove();
  });

  it("applyPresetLayer writes any prop from the bag and restores on clear", () => {
    const host = mockHost() as HTMLElement & Record<string, unknown>;
    host.variant = "solid";
    host.size = "md";
    host.label = "Button";
    host.iconL = "";

    const changed = applyPresetLayer(host, {
      variant: "shadow",
      size: "sm",
      label: "Save",
      iconL: "ion:checkmark",
    });
    expect(changed).toBe(true);
    expect(host.variant).toBe("shadow");
    expect(host.size).toBe("sm");
    expect(host.label).toBe("Save");
    expect(host.iconL).toBe("ion:checkmark");

    applyPresetLayer(host, { variant: "shadow" });
    expect(host.size).toBe("md");
    expect(host.label).toBe("Button");
    expect(host.iconL).toBe("");
    expect(host.variant).toBe("shadow");
  });

  it("applyPresetLayer ignores Lit-reflected constructor defaults", () => {
    const attrs = new Set<string>();
    const host = {
      variant: "solid",
      getAttributeNames: () => [...attrs],
      hasAttribute: (name: string) => attrs.has(name),
      setAttribute: (name: string) => {
        attrs.add(name);
      },
    } as unknown as HTMLElement & { variant: string };
    Object.defineProperty(host, "constructor", {
      value: { elementProperties: new Map([["variant", {}]]) },
    });
    captureBuiltInPropSnapshot(host);
    captureInitialUserAttributes(host);
    host.setAttribute("variant", "solid");
    applyPresetLayer(host, { variant: "ghost" });
    expect(host.variant).toBe("ghost");
  });

  it("markUserSetProp and divergence keep property-only overrides", () => {
    const host = mockHost() as HTMLElement & Record<string, unknown>;
    host.color = "primary";
    captureInitialUserAttributes(host);

    applyPresetLayer(host, { color: "danger", size: "sm" });
    expect(host.color).toBe("danger");

    // Consumer property-only override after apply
    host.color = "info";
    applyPresetLayer(host, { color: "danger", size: "md" });
    expect(host.color).toBe("info");
    expect(host.size).toBe("md");
    expect(isUserSetProp(host, "color")).toBe(true);
  });

  it("explicit markUserSetProp blocks first apply", () => {
    const host = mockHost() as HTMLElement & Record<string, unknown>;
    host.color = "primary";
    captureInitialUserAttributes(host);
    markUserSetProp(host, "color");
    applyPresetLayer(host, { color: "danger" });
    expect(host.color).toBe("primary");
  });

  it("getPresetLayer merges defaults under named preset", () => {
    const layer = getPresetLayer(
      {
        defaults: { button: { variant: "shadow", size: "sm" } },
        presets: {
          button: { cancel: { color: "danger", size: "md" } },
        },
      },
      "button",
      "cancel",
    );
    expect(layer).toEqual({
      variant: "shadow",
      size: "md",
      color: "danger",
    });
  });

  it("getPresetLayer skips defaults when preset opts out", () => {
    const config: ComponentPresetsConfig = {
      defaults: { button: { variant: "shadow", size: "sm", iconL: "ion:check" } },
      presets: {
        button: {
          toolbar: { $inheritDefaults: false, color: "danger", size: "md" },
        },
      },
    };

    expect(getPresetLayer(config, "button", "toolbar")).toEqual({
      color: "danger",
      size: "md",
    });
    // Opting out is per preset — defaults still apply with no preset.
    expect(getPresetLayer(config, "button", null)).toEqual({
      variant: "shadow",
      size: "sm",
      iconL: "ion:check",
    });
  });

  it("framework property binding before first apply is user-owned", () => {
    const host = mockHost() as HTMLElement & Record<string, unknown>;
    host.color = "primary";
    host.size = "md";
    Object.defineProperty(host, "constructor", {
      value: {
        elementProperties: new Map([
          ["color", {}],
          ["size", {}],
        ]),
      },
    });
    captureBuiltInPropSnapshot(host);
    captureInitialUserAttributes(host);

    // Vue/React assign a property (no attribute) before presets run
    host.color = "success";

    applyPresetLayer(host, { color: "danger", size: "sm" });
    expect(host.color).toBe("success");
    expect(host.size).toBe("sm");
    expect(isUserSetProp(host, "color")).toBe(true);
  });

  it("bare host still receives preset when value matches constructor snapshot", () => {
    const host = mockHost() as HTMLElement & Record<string, unknown>;
    host.color = "primary";
    Object.defineProperty(host, "constructor", {
      value: { elementProperties: new Map([["color", {}]]) },
    });
    captureBuiltInPropSnapshot(host);
    captureInitialUserAttributes(host);

    applyPresetLayer(host, { color: "danger" });
    expect(host.color).toBe("danger");
  });

  it("switching to an opted-out preset reverts default-only props", () => {
    const host = mockHost() as unknown as HTMLElement &
      Record<string, unknown>;
    host.variant = "solid";
    host.iconL = "";
    host.color = "primary";
    captureInitialUserAttributes(host);

    const config: ComponentPresetsConfig = {
      defaults: { button: { variant: "shadow", iconL: "ion:check" } },
      presets: {
        button: { toolbar: { $inheritDefaults: false, color: "danger" } },
      },
    };

    applyPresetLayer(host, getPresetLayer(config, "button", null));
    expect(host.iconL).toBe("ion:check");

    applyPresetLayer(host, getPresetLayer(config, "button", "toolbar"));
    expect(host.color).toBe("danger");
    expect(host.iconL).toBe("");
    expect(host.variant).toBe("solid");
  });
});

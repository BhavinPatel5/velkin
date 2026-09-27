import { describe, expect, it } from "vitest";
import type { PopoverPreset } from "../popover-controller.js";
import { POPOVER_PRESET_REGISTRY, popoverKf } from "../popover-presets.js";

const ALL_PRESETS = Object.keys(POPOVER_PRESET_REGISTRY) as PopoverPreset[];

describe("popover-presets", () => {
  it("defines every PopoverPreset key", () => {
    expect(ALL_PRESETS.length).toBeGreaterThan(20);
    for (const name of ALL_PRESETS) {
      expect(POPOVER_PRESET_REGISTRY[name].name).toBe(name);
    }
  });

  it("fade fades opacity via scale transform", () => {
    const def = POPOVER_PRESET_REGISTRY.fade;
    const open = def.getKeyframes({
      side: "bottom",
      phase: "open",
      cfg: def.defaults,
      origin: "50% 0%",
    });
    expect(open[0]?.opacity).toBe(0);
    expect(open.at(-1)?.opacity).toBe(1);
  });

  it("slide moves along the placement side", () => {
    const def = POPOVER_PRESET_REGISTRY.slide;
    const open = def.getKeyframes({
      side: "bottom",
      phase: "open",
      cfg: def.defaults,
      origin: "50% 0%",
    });
    expect(String(open[0]?.transform)).toContain("translate3d(0px, -10px, 0)");
    expect(open[0]?.opacity).toBe(0);
  });

  it("depth3d uses px z-depth (WAAPI-interpolatable)", () => {
    const def = POPOVER_PRESET_REGISTRY.depth3d;
    const open = def.getKeyframes({
      side: "bottom",
      phase: "open",
      cfg: def.defaults,
      origin: "50% 50%",
    });
    expect(String(open[0]?.transform)).toContain("-48px");
    expect(String(open[0]?.transform)).not.toContain("var(");
  });

  it("popoverKf supports keyframe offset", () => {
    const frame = popoverKf(1, "scale(1)", { offset: 0.85 });
    expect(frame.offset).toBe(0.85);
  });
});

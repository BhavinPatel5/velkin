import { describe, expect, it } from "vitest";
import type { VuControlTone } from "./control-tone.js";

describe("VuControlTone", () => {
  it("accepts the three intensity steps", () => {
    const tones: VuControlTone[] = ["subtle", "normal", "strong"];
    expect(tones).toHaveLength(3);
  });
});

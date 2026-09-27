import { describe, expect, it } from "vitest";
import {
  litBrowserResolveConditions,
  litNodeResolveConditions,
  readLitMode,
} from "../../../scripts/lit-mode.mjs";

describe("lit-mode (starter-style MODE)", () => {
  it("defaults to prod", () => {
    expect(readLitMode({})).toBe("prod");
  });

  it("rejects unknown MODE", () => {
    expect(() => readLitMode({ MODE: "staging" })).toThrow(/MODE must be/);
  });

  it("adds development only in dev browser conditions", () => {
    expect(litBrowserResolveConditions("prod")).not.toContain("development");
    expect(litBrowserResolveConditions("dev").slice(0, 2)).toEqual(["browser", "development"]);
  });

  it("keeps node first for SSR conditions", () => {
    expect(litNodeResolveConditions("prod")[0]).toBe("node");
    expect(litNodeResolveConditions("dev").slice(0, 2)).toEqual(["node", "development"]);
  });
});

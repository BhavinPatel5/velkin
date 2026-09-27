import { describe, expect, it } from "vitest";
import { isHostnameAllowed } from "../../../packages/license/src/validate-key.js";

describe("license domain matching", () => {
  it("matches exact hostnames case-insensitively", () => {
    expect(isHostnameAllowed("APP.Example.com", ["app.example.com"])).toBe(true);
    expect(isHostnameAllowed("example.com", ["app.example.com"])).toBe(false);
  });

  it("matches wildcard subdomains but not the apex", () => {
    expect(isHostnameAllowed("app.example.com", ["*.example.com"])).toBe(true);
    expect(isHostnameAllowed("deep.app.example.com", ["*.example.com"])).toBe(true);
    expect(isHostnameAllowed("example.com", ["*.example.com"])).toBe(false);
    expect(isHostnameAllowed("notexample.com", ["*.example.com"])).toBe(false);
  });

  it("normalizes a trailing DNS dot", () => {
    expect(isHostnameAllowed("app.example.com.", ["app.example.com"])).toBe(true);
  });
});

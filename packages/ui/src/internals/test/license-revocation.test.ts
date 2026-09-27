import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getCachedRevocation,
  syncRevocationStatus,
} from "../../../packages/license/src/revocation.js";

describe("license revocation sync", () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it("caches a revocation by jti for the next boot", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "revoked" }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const jti = "8f14e45f-ea17-4b7a-9c07-6f7b46f9a102";

    await syncRevocationStatus(jti, "/api/v1/license/check");

    expect(getCachedRevocation(jti)?.status).toBe("revoked");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("fails open when the status service is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const jti = "7f14e45f-ea17-4b7a-9c07-6f7b46f9a103";

    await expect(syncRevocationStatus(jti, "/api/v1/license/check")).resolves.toBeUndefined();
    expect(getCachedRevocation(jti)).toBeNull();
  });

  it("rate-limits repeat checks within the same session", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "active" }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const jti = "6f14e45f-ea17-4b7a-9c07-6f7b46f9a104";

    await syncRevocationStatus(jti, "/api/v1/license/check");
    await syncRevocationStatus(jti, "/api/v1/license/check");

    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

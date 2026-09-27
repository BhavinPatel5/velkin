export type VelkinMcpTruthLayer = "authoritative" | "snapshot" | "heuristic";

export type VelkinMcpMeta = {
  truthLayer: VelkinMcpTruthLayer;
  source?: string;
  generatedAt?: string;
  agentMust?: string;
};

export function withVelkinMcpMeta<T extends Record<string, unknown>>(
  payload: T,
  meta: VelkinMcpMeta,
): T & { _velkinMcp: VelkinMcpMeta } {
  return { ...payload, _velkinMcp: meta };
}

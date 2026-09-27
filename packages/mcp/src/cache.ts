const cache = new Map<string, { value: unknown; expires: number }>();
const inflight = new Map<string, Promise<unknown>>();

export function getCached<T>(key: string, ttlMs: number, loader: () => T): T {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;
  const value = loader();
  cache.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

export async function getCachedAsync<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;
  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;
  const promise = loader().then((value) => {
    cache.set(key, { value, expires: Date.now() + ttlMs });
    inflight.delete(key);
    return value;
  });
  inflight.set(key, promise);
  return promise;
}

export function clearCache(): void {
  cache.clear();
  inflight.clear();
}

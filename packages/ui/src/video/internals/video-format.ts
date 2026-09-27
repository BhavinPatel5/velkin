/** Formats seconds as `m:ss` or `h:mm:ss` for the control bar clock. */
export function formatVideoTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

/** Formats remaining time with a leading minus. */
export function formatVideoRemaining(current: number, duration: number): string {
  const left = Math.max(0, duration - current);
  return `-${formatVideoTime(left)}`;
}

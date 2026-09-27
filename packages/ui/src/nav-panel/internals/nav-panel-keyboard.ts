/** Returns the next roving tabindex target index (wraps). */
export function stepRovingIndex(current: number, delta: number, length: number): number {
  if (length <= 0) return 0;
  return (current + delta + length) % length;
}

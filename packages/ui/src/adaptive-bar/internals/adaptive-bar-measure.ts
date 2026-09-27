/** Parses a CSS length string to px; returns 0 when not finite. */
export function adaptiveBarParsePx(value: string): number {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export type AdaptiveBarMeasureInput = {
  itemWidths: readonly number[];
  itemGap: number;
  availableWidth: number;
  buffer: number;
};

export type AdaptiveBarMeasureResult = {
  /** Number of trailing items that must move to overflow. */
  hiddenCount: number;
  fullyOverflowed: boolean;
};

/** Computes how many trailing items exceed the inline budget (includes inter-item gaps). */
export function adaptiveBarMeasureLayout(input: AdaptiveBarMeasureInput): AdaptiveBarMeasureResult {
  const { itemWidths, itemGap, availableWidth, buffer } = input;
  if (itemWidths.length === 0) {
    return { hiddenCount: 0, fullyOverflowed: false };
  }

  const budget = availableWidth - buffer;
  let total = 0;
  let firstOverflowIndex = itemWidths.length;

  for (let i = 0; i < itemWidths.length; i++) {
    const extraGap = i > 0 ? itemGap : 0;
    const next = total + extraGap + itemWidths[i];
    if (next > budget) {
      firstOverflowIndex = i;
      break;
    }
    total = next;
  }

  const hiddenCount = itemWidths.length - firstOverflowIndex;
  return {
    hiddenCount,
    fullyOverflowed: hiddenCount === itemWidths.length,
  };
}

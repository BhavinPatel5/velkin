/** True when RGB channels are within 1 step of each other (neutral gray). */
export function isGrayRgb(rgb: { r: number; g: number; b: number }): boolean {
  return (
    Math.abs(rgb.r - rgb.g) <= 1 && Math.abs(rgb.g - rgb.b) <= 1 && Math.abs(rgb.r - rgb.b) <= 1
  );
}

/** Keeps prior hue on grays so sliders/areas do not snap to 0° arbitrarily. */
export function preserveHueOnGray(
  rgb: { r: number; g: number; b: number },
  priorHue: number,
  nextHue: number,
): number {
  return isGrayRgb(rgb) ? priorHue : nextHue;
}

# Theme guidelines

How to author a Velkin brand palette that is accessible, original, and consistent with the shipped default theme.

Use this whenever you add a `VuThemeConfig` or a theme preset.

For the Velkin source workspace, `npm run check:theme` checks the documented solid-intent
contrast targets and accent hue separation. Consumers should test their own rendered foreground,
background, font size, and interaction states with an accessibility audit tool.

## 1. Never eyeball contrast

A color that "looks light enough for white text" and a color that *passes 4.5:1 against white* are different things. Saturated mid-lightness accents (`L` 0.55–0.75) are the usual failure: too dark for snow, too light to read as "dark." Compute contrast with `checkSolidPair` before shipping.

## 2. OKLCH

Every semantic token is `oklch(L C H)`:

- **L** — 0–1, perceptually uniform lightness
- **C** — chroma; usable UI fills are usually 0.12–0.24
- **H** — 0–360. Landmarks: 20–30 red, 70–90 amber, 140–160 green, 190–210 teal, 230–260 blue, 280–300 violet, 340–360 pink

Hold **L** steady while changing **H** so accent / danger / warning / success feel like one system.

## 3. Contrast thresholds (WCAG 2.1 AA)

| Use | Minimum |
|-----|---------|
| Normal text (button labels) | **4.5:1** |
| Large text (18px+ / 14px+ bold) | 3:1 |
| Non-text UI (icons, focus rings) | 3:1 |

Design every semantic fill to pass **4.5:1** with its paired foreground. Do not rely on the large-text exception.

## 4. Foreground pairing

**Heuristic (verify):**

- `L` ≳ 0.55–0.60 → `var(--vu-eclipse)`
- `L` ≲ 0.45 → `var(--vu-snow)`
- 0.45–0.55 → compute both; take the winner (`recommendedForegroundToken` / `autoForegroundFor`)

The shipped default uses eclipse on every intent because the palette lives in that vivid mid-to-high L band. White-on-accent is fine for a deliberately dark fill — only after the script says so.

## 5. Process

1. **Change accent for brand.** Keep danger / warning / success in red / amber / green. Shift those hues at most ±10–15° to match temperature — never enough to make "success" look like the brand color.
2. **Pick the accent hue with intent.** Blue reads familiar/technical, teal precise, violet premium, amber warm, coral consumer. Check the actual category so a "distinct" hue is not a cliché there.
3. **Hue separation.** Keep ≥ **40°** (circular) between accent and each of danger / warning / success. An amber accent next to an amber warning is a usability bug. If the brand *is* gold, shift warning (still amber-family) until the gap clears 40°.
4. **Light-mode L/C**, then validate. Start from the table below. If both foregrounds fail AA, raise **L** first, chroma second; only move **H** to change personality.
5. **Derive dark independently.** Drop chroma ~10–20% (same saturation reads neon on near-black). Nudge L slightly and validate — do not reuse the light OKLCH string.
6. **Validate the whole set** (both modes) with `npm run check:theme`.
7. **Originality.** If you scaffolded from another palette, change the accent hue and spot-check neutrals (background, border, surface) for accidental exact-decimal matches.

## 6. Starting ranges (not guarantees)

| Family | Approx H | Light L | Light C | Notes |
|--------|----------|---------|---------|-------|
| Red | 18–26 | 0.64–0.70 | 0.18–0.20 | Needs higher L than intuition; saturated L~0.55 fails AA with dark text |
| Amber | 70–85 | 0.76–0.82 | 0.13–0.16 | Easiest AA; large margin with eclipse |
| Green | 140–155 | 0.68–0.73 | 0.14–0.19 | Comfortable with eclipse |
| Teal | 185–200 | 0.64–0.70 | 0.12–0.15 | Quieter at lower chroma |
| Blue | 230–255 | 0.60–0.66 | 0.16–0.19 | Common in dev tools — pick a distinctive H |
| Violet | 285–300 | 0.62–0.68 | 0.17–0.20 | Tightest AA margin — validate carefully |
| Pink | 340–355 | 0.62–0.68 | 0.17–0.20 | Similar to violet |

`startingAccentOklch(hue, mode, chroma?)` returns these midpoints. Always run the validator.

## 7. Pre-ship checklist

- [ ] Each of accent / danger / warning / success has a distinct light and dark value
- [ ] Each fill passes AA (4.5:1) with its **assigned** foreground
- [ ] Foreground (`snow` vs `eclipse`) came from the script
- [ ] Accent hue ≥ ~40° from danger, warning, and success
- [ ] Danger / warning / success stayed in conventional families unless there is a deliberate reason
- [ ] Scaffolded palettes changed identifying hues (and neutrals were spot-checked)
- [ ] `npm run check:theme` is green

export {
  intentForegroundForRole,
  minContrastForIntentRole,
  type IntentForegroundRole,
} from "./theme-contrast.js";

/** Map `--vu-color-*` fill keys to intent roles for foreground patching. */
export const INTENT_FILL_KEY_TO_ROLE = {
  "color-accent": "accent",
  "color-success": "success",
  "color-warning": "warning",
  "color-danger": "danger",
  "color-default": "default",
} as const;

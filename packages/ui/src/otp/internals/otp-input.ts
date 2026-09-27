/** OTP cell surface the input handlers read and mutate. */
export type OtpInputHost = {
  length: number;
  alphanumeric: boolean;
  masked: boolean;
  disabled: boolean;
  readonly: boolean;
  value: string;
  displayValues: string[];
  shadowRoot: ShadowRoot | null;
  requestUpdate(name?: PropertyKey, oldValue?: unknown): void;
};

const DIGIT = /^[0-9]$/;
const ALNUM = /^[a-zA-Z0-9]$/;

export function isValidOtpChar(host: OtpInputHost, char: string): boolean {
  if (!char) return false;
  return host.alphanumeric ? ALNUM.test(char) : DIGIT.test(char);
}

/** Keeps `displayValues` aligned with `length`. */
export function ensureOtpDisplayBuffer(host: OtpInputHost): void {
  if (host.displayValues.length === host.length) return;
  const old = host.displayValues;
  host.displayValues = Array.from({ length: host.length }, (_, i) => old[i] ?? "");
}

/** Copies canonical `value` into the display buffer. */
export function syncOtpDisplayFromValue(host: OtpInputHost): void {
  ensureOtpDisplayBuffer(host);
  const v = (host.value ?? "").slice(0, host.length);
  for (let i = 0; i < host.length; i++) host.displayValues[i] = v[i] ?? "";
}

function syncCanonicalFromDisplay(host: OtpInputHost): void {
  host.value = host.displayValues.join("").slice(0, host.length);
}

/** Handles native `input` on one OTP cell. */
export function handleOtpCellInput(host: OtpInputHost, event: Event, index: number): void {
  if (host.disabled || host.readonly) {
    event.preventDefault();
    return;
  }

  ensureOtpDisplayBuffer(host);
  const inputs = host.shadowRoot?.querySelectorAll<HTMLInputElement>(".otp-cell");
  const target = event.target as HTMLInputElement;
  const ie = event as InputEvent;
  const raw = (typeof ie.data === "string" ? ie.data : target.value) ?? "";
  const char = raw.slice(-1);

  if (char && !isValidOtpChar(host, char)) {
    target.value = "";
    host.displayValues[index] = "";
    syncCanonicalFromDisplay(host);
    host.requestUpdate("value");
    return;
  }

  host.displayValues[index] = char;
  syncCanonicalFromDisplay(host);
  host.requestUpdate("value");

  if (inputs && char && index < host.length - 1) inputs[index + 1]?.focus();
}

/** Handles keyboard navigation between OTP cells. */
export function handleOtpCellKeydown(
  host: OtpInputHost,
  event: KeyboardEvent,
  index: number,
): void {
  const inputs = host.shadowRoot?.querySelectorAll<HTMLInputElement>(".otp-cell");
  if (!inputs) return;

  switch (event.key) {
    case "Backspace": {
      if (!inputs[index].value && index > 0) {
        inputs[index - 1].focus();
      } else {
        ensureOtpDisplayBuffer(host);
        host.displayValues[index] = "";
        syncCanonicalFromDisplay(host);
        inputs[index].value = "";
        host.requestUpdate("value");
      }
      break;
    }
    case "ArrowLeft":
      if (index > 0) inputs[index - 1].focus();
      break;
    case "ArrowRight":
      if (index < host.length - 1) inputs[index + 1].focus();
      break;
    default:
      break;
  }
}

/** Distributes pasted characters across cells. */
export function handleOtpPaste(host: OtpInputHost, event: ClipboardEvent): string[] {
  if (host.disabled || host.readonly) {
    event.preventDefault();
    return host.displayValues;
  }

  event.preventDefault();
  const clipboardData = event.clipboardData?.getData("text") ?? "";
  const filtered = host.alphanumeric
    ? clipboardData.replace(/[^a-zA-Z0-9]/g, "")
    : clipboardData.replace(/\D/g, "");
  const chars = filtered.slice(0, host.length).split("");
  host.displayValues = Array.from({ length: host.length }, (_, i) => chars[i] ?? "");
  syncCanonicalFromDisplay(host);
  host.requestUpdate("value");
  return host.displayValues;
}

/** Focuses the first empty cell, or the last cell when full. */
export function focusOtpAfterPaste(host: OtpInputHost): void {
  const inputs = host.shadowRoot?.querySelectorAll<HTMLInputElement>(".otp-cell");
  if (!inputs) return;
  const firstEmpty = Array.from(inputs).find((_, i) => !host.displayValues[i]);
  if (firstEmpty) firstEmpty.focus();
  else inputs[host.length - 1]?.focus();
}

/** Clears native input values after programmatic reset. */
export function clearOtpNativeInputs(host: OtpInputHost): void {
  const inputs = host.shadowRoot?.querySelectorAll<HTMLInputElement>(".otp-cell");
  inputs?.forEach((input) => {
    input.value = "";
  });
}

/** Replays shake affordance when `focus()` targets the control. */
export function triggerOtpShake(host: OtpInputHost): void {
  const row = host.shadowRoot?.querySelector(".otp-cells");
  if (!(row instanceof HTMLElement)) return;
  row.classList.remove("shake");
  void row.offsetWidth;
  row.classList.add("shake");
}

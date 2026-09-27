import {
  canonicalSerialFromRaw,
  ensureSerialDisplayBuffer,
  getSerialRawFromDisplay,
  normalizeSerialRaw,
  type SerialValueHost,
} from "./serial-value.js";

/** Serial cell surface the input handlers read and mutate. */
export type SerialInputHost = SerialValueHost & {
  masked: boolean;
  disabled: boolean;
  readonly: boolean;
  shadowRoot: ShadowRoot | null;
  requestUpdate(name?: PropertyKey, oldValue?: unknown): void;
};

const DIGIT = /^[0-9]$/;
const ALNUM = /^[a-zA-Z0-9]$/;

function isValidChar(host: SerialInputHost, char: string): boolean {
  if (!char) return false;
  return host.alphanumeric ? ALNUM.test(char) : DIGIT.test(char);
}

function applyDisplayToValue(host: SerialInputHost): void {
  const raw = getSerialRawFromDisplay(host);
  host.value = canonicalSerialFromRaw(host, raw);
  host.requestUpdate("value");
}

/** Handles native `input` on one serial cell. */
export function handleSerialCellInput(host: SerialInputHost, event: Event, index: number): void {
  if (host.disabled || host.readonly) {
    event.preventDefault();
    return;
  }

  ensureSerialDisplayBuffer(host);
  const inputs = host.shadowRoot?.querySelectorAll<HTMLInputElement>(".serial-cell");
  const target = event.target as HTMLInputElement;
  const ie = event as InputEvent;
  const rawIn = (typeof ie.data === "string" ? ie.data : target.value) ?? "";
  const char = rawIn.slice(-1);

  if (char && !isValidChar(host, char)) {
    target.value = "";
    host.displayValues[index] = "";
    applyDisplayToValue(host);
    return;
  }

  host.displayValues[index] = char;
  applyDisplayToValue(host);

  if (inputs && char && index < host.length - 1) inputs[index + 1]?.focus();
}

/** Handles keyboard navigation between serial cells. */
export function handleSerialCellKeydown(
  host: SerialInputHost,
  event: KeyboardEvent,
  index: number,
): void {
  const inputs = host.shadowRoot?.querySelectorAll<HTMLInputElement>(".serial-cell");
  if (!inputs) return;

  switch (event.key) {
    case "Backspace": {
      if (!inputs[index].value && index > 0) {
        inputs[index - 1].focus();
      } else {
        ensureSerialDisplayBuffer(host);
        host.displayValues[index] = "";
        inputs[index].value = "";
        applyDisplayToValue(host);
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
export function handleSerialPaste(host: SerialInputHost, event: ClipboardEvent): void {
  if (host.disabled || host.readonly) {
    event.preventDefault();
    return;
  }

  event.preventDefault();
  const clipboardData = event.clipboardData?.getData("text") ?? "";
  const raw = normalizeSerialRaw(host, clipboardData);
  host.displayValues = Array.from({ length: host.length }, (_, i) => raw[i] ?? "");
  host.value = canonicalSerialFromRaw(host, raw);
  host.requestUpdate("value");
}

/** Focuses the first empty cell, or the last cell when full. */
export function focusSerialAfterPaste(host: SerialInputHost): void {
  const inputs = host.shadowRoot?.querySelectorAll<HTMLInputElement>(".serial-cell");
  if (!inputs) return;
  const firstEmpty = Array.from(inputs).find((_, i) => !host.displayValues[i]);
  if (firstEmpty) firstEmpty.focus();
  else inputs[host.length - 1]?.focus();
}

/** Clears native input values after programmatic reset. */
export function clearSerialNativeInputs(host: SerialInputHost): void {
  const inputs = host.shadowRoot?.querySelectorAll<HTMLInputElement>(".serial-cell");
  inputs?.forEach((input) => {
    input.value = "";
  });
}

/** Replays shake affordance when `focus()` targets the control. */
export function triggerSerialShake(host: SerialInputHost): void {
  const row = host.shadowRoot?.querySelector(".serial-cells");
  if (!(row instanceof HTMLElement)) return;
  row.classList.remove("shake");
  void row.offsetWidth;
  row.classList.add("shake");
}

import type {
  VuInputChangeDetail,
  VuInputClearDetail,
  VuInputFileDetail,
  VuInputInvalidDetail,
} from "../input.types.js";

export function emitInputChange(host: EventTarget, detail: VuInputChangeDetail): void {
  host.dispatchEvent(
    new CustomEvent<VuInputChangeDetail>("vu-change", {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
}

export function emitInputClear(host: EventTarget, detail: VuInputClearDetail): void {
  host.dispatchEvent(
    new CustomEvent<VuInputClearDetail>("vu-clear", {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
}

export function emitInputInvalid(host: EventTarget, detail: VuInputInvalidDetail): void {
  host.dispatchEvent(
    new CustomEvent<VuInputInvalidDetail>("vu-invalid", {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
}

export function emitInputFile(host: EventTarget, detail: VuInputFileDetail): void {
  host.dispatchEvent(
    new CustomEvent<VuInputFileDetail>("vu-file", {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
}

import type { VuFormValues } from "../form.types.js";

type NamedControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

type NamedField = HTMLElement & {
  name?: string;
  disabled?: boolean;
  value?: unknown;
  checked?: boolean;
  getFormValue?: () => string | File | FormData | null;
};

function isNativeNamedControl(el: Element): el is NamedControl {
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement
  );
}

function appendIfAbsent(fd: FormData, present: Set<string>, name: string, value: string): void {
  if (present.has(name)) return;
  fd.append(name, value);
  present.add(name);
}

function appendFieldValue(
  fd: FormData,
  present: Set<string>,
  name: string,
  value: unknown,
): boolean {
  if (value === undefined || value === null) return false;
  if (value instanceof File) {
    if (present.has(name)) return true;
    fd.append(name, value);
    present.add(name);
    return true;
  }
  if (value instanceof FormData) {
    for (const [key, entry] of value.entries()) {
      fd.append(key, entry);
      present.add(key);
    }
    return true;
  }
  if (Array.isArray(value)) {
    if (present.has(name)) return true;
    for (const item of value) fd.append(name, String(item));
    present.add(name);
    return true;
  }
  appendIfAbsent(fd, present, name, String(value));
  return true;
}

/** Drop a native/jsdom guess for `name`, then write the vu-* value. */
function replaceFieldValue(
  fd: FormData,
  present: Set<string>,
  name: string,
  value: unknown,
): boolean {
  fd.delete(name);
  present.delete(name);
  return appendFieldValue(fd, present, name, value);
}

/**
 * Builds `FormData` for a shadow-hosted `<form>` with slotted light-DOM controls.
 * Starts from the native form, then fills gaps from named light-DOM fields
 * (jsdom and some association edge cases omit slotted controls from `FormData`).
 */
export function collectFormData(form: HTMLFormElement, host: HTMLElement): FormData {
  const fd = new FormData(form);
  const present = new Set(fd.keys());

  for (const el of host.querySelectorAll<NamedField>("[name]")) {
    const name = String(el.name || el.getAttribute("name") || "").trim();
    if (!name || el.disabled) continue;
    if (el.localName === "vu-button") continue;

    if (isNativeNamedControl(el)) {
      const type = "type" in el ? String(el.type) : "";
      if (type === "submit" || type === "reset" || type === "button" || type === "image") {
        continue;
      }
      if (type === "file") continue;

      if (type === "checkbox" || type === "radio") {
        const input = el as HTMLInputElement;
        if (!input.checked) continue;
        if (type === "radio" && present.has(el.name)) continue;
        fd.append(el.name, input.value || "on");
        present.add(el.name);
        continue;
      }

      appendIfAbsent(fd, present, el.name, el.value);
      continue;
    }

    if (el.localName === "vu-radio-group") {
      const group = el as NamedField & { getSelectedValue?: () => string };
      let selected = group.getSelectedValue?.() ?? "";
      if (!selected) {
        for (const radio of el.querySelectorAll<NamedField>("vu-radio")) {
          if (!radio.checked) continue;
          selected = String(radio.value || radio.getAttribute("value") || "on");
          break;
        }
      }
      fd.delete(name);
      present.delete(name);
      if (selected) replaceFieldValue(fd, present, name, selected);
      continue;
    }

    if (el.localName === "vu-checkbox-group") {
      const group = el as NamedField & { getSelectedValues?: () => string[] };
      let values = group.getSelectedValues?.() ?? [];
      if (!values.length) {
        values = [];
        for (const box of el.querySelectorAll<NamedField>("vu-checkbox")) {
          if (!box.checked) continue;
          values.push(String(box.value || box.getAttribute("value") || "on"));
        }
      }
      fd.delete(name);
      present.delete(name);
      if (values.length) replaceFieldValue(fd, present, name, values);
      continue;
    }

    if (el.closest("vu-radio-group") || el.closest("vu-checkbox-group")) {
      continue;
    }

    if (el.localName === "vu-range") {
      const range = el as NamedField & { from?: number; to?: number };
      if (typeof range.from === "number" && typeof range.to === "number") {
        replaceFieldValue(fd, present, name, `${range.from},${range.to}`);
        continue;
      }
    }

    if (
      el.localName === "vu-checkbox" ||
      el.localName === "vu-switch" ||
      el.localName === "vu-radio"
    ) {
      if (!el.checked) {
        fd.delete(name);
        present.delete(name);
        continue;
      }
      if (typeof el.getFormValue === "function") {
        const submitted = el.getFormValue();
        if (submitted != null && String(submitted).trim() !== "") {
          if (replaceFieldValue(fd, present, name, submitted)) continue;
        }
      }
      const raw = el.value ?? el.getAttribute("value");
      replaceFieldValue(fd, present, name, raw && String(raw).trim() ? String(raw) : "on");
      continue;
    }

    if (typeof el.getFormValue === "function") {
      const submitted = el.getFormValue();
      if (replaceFieldValue(fd, present, name, submitted)) continue;
    }

    replaceFieldValue(fd, present, name, el.value);
  }

  return fd;
}

/** Converts `FormData` into a plain object (duplicate keys become arrays). */
export function formDataToJson(fd: FormData): VuFormValues {
  const obj: VuFormValues = {};

  fd.forEach((value, key) => {
    if (key in obj) {
      const existing = obj[key];
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        obj[key] = [existing, value];
      }
    } else {
      obj[key] = value;
    }
  });

  return obj;
}

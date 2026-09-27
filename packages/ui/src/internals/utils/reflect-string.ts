import type { ComplexAttributeConverter, PropertyDeclaration } from "lit";

/** Drop blank / null / undefined so Lit removes the attribute instead of writing `name=""`. */
export const omitEmptyString: ComplexAttributeConverter<string> = {
  fromAttribute: (value) => value ?? "",
  toAttribute: (value) => {
    const s = String(value ?? "").trim();
    return s.length > 0 ? s : null;
  },
};

/** `@property(reflectString)` — reflect non-empty strings only. */
export const reflectString: PropertyDeclaration = {
  type: String,
  reflect: true,
  converter: omitEmptyString,
};

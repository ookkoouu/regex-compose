import type { Groups, RegExpT } from "./types.ts";

function createDummyTSA(length: number): TemplateStringsArray {
  const arr = new Array(length).fill("") as string[] & {
    raw: readonly string[];
  };
  arr.raw = Object.freeze(new Array(length).fill(""));
  return Object.freeze(arr) as TemplateStringsArray;
}

function toStr(v: unknown): string {
  if (v == null) {
    return "";
  }
  if (v instanceof RegExp) {
    return v.source;
  }
  if (Array.isArray(v)) {
    return v.flatMap((e) => toStr(e)).join("");
  }
  return `${v}`;
}

export function regex<const V extends unknown[]>(
  literals: TemplateStringsArray | null,
  ...values: V
): RegExpT<Groups<V>> {
  if (literals == null) {
    literals = createDummyTSA(values.length);
  }
  if (literals.length === 0) {
    return /(?:)/ as RegExpT<Groups<V>>;
  }

  const templates = literals.raw;
  let result = "";
  for (let i = 0; i < values.length; i++) {
    result += templates[i];
    result += toStr(values[i]);
  }
  result += templates.at(-1);

  return new RegExp(result, "v") as RegExpT<Groups<V>>;
}

export const r = regex;

/**
 * override flag of RegExp given
 * @param regexp
 * @param flags
 * @returns
 */
export function setFlag<T extends RegExp>(regexp: T, flags: string): T {
  return new RegExp(regexp.source, flags) as T;
}

export function escapeMeta(s: string): string {
  return s.replaceAll(/[.*+?^${}()[\]\\|]/g, "\\$&");
}

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

const supportedFlags = [..."abcdefghijklmnopqrstuvwxyz"].filter((f) => {
  try {
    new RegExp("", f);
    return true;
  } catch {
    return false;
  }
});

export function flag<T extends RegExp>(flags: string, regexp: T): T {
  const filterd = supportedFlags
    .filter((f) => [...flags, "v"].includes(f))
    .join("");
  return new RegExp(regexp.source, filterd) as T;
}

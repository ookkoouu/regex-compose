import type { RegExpT } from "./types.ts";

type SubGroup<T extends unknown[], E = T[number]> =
  E extends RegExpT<infer U> ? U : never;

const allFlags = [...Array(26)]
  .map((_, i) => String.fromCharCode(97 + i))
  .filter((f) => {
    try {
      new RegExp("", f);
      return true;
    } catch {
      return false;
    }
  })
  .join("");

const regFlagSuffix = new RegExp(String.raw`/[${allFlags}]*\s*$`);

export function isBetweenSlash(first: string, last: string): boolean {
  return (
    first.startsWith("/") &&
    !!last.match(new RegExp(String.raw`/[${allFlags}]*$`))
  );
}

export function getFlag(s: string): string {
  return (
    new RegExp(String.raw`/(?<flag>[${allFlags}]+)$`).exec(s)?.groups?.flag ??
    ""
  );
}

/**
 * template function to composing regexes.
 * @example
 * ```
 * const digit = r`\d`;
 * const hex = r`/[${digit}a-f]+/i`;
 * ```
 */
export function regex<const Sub extends unknown[]>(
  literals: TemplateStringsArray,
  ...substitutions: Sub
): RegExpT<SubGroup<Sub>>;
export function regex(
  literals: TemplateStringsArray,
  ...substitutions: unknown[]
): RegExp {
  if (literals.length === 0) {
    return /(?:)/;
  }

  const templates = [...literals.raw];
  const last = templates.length - 1;
  const flags = isBetweenSlash(templates[0], templates[last])
    ? (getFlag(templates[last]) ?? "")
    : "";

  if (isBetweenSlash(templates[0], templates[last])) {
    templates[0] = templates[0].slice(1);
    templates[last] = templates[last].replace(regFlagSuffix, "");
  }

  let result = "";
  for (let i = 0; i < templates.length; i++) {
    const tmpl = templates[i];
    const sub = substitutions[i] ?? "";

    result += tmpl;
    result += sub instanceof RegExp ? sub.source : String(sub);
  }

  return new RegExp(result, flags);
}
export const r = regex;

/**
 * "u" flag by default.
 */
export function regexUnicode<const Sub extends unknown[]>(
  literals: TemplateStringsArray,
  ...substitutions: Sub
): RegExpT<SubGroup<Sub>>;
export function regexUnicode(
  literals: TemplateStringsArray,
  ...substitutions: unknown[]
): RegExp {
  let reg = regex(literals, ...substitutions);
  reg = reg.unicode ? reg : new RegExp(reg.source, `${reg.flags}u`);
  return reg;
}

export const ru = regexUnicode;

// /**
//  * Supports additional flags in a subexpression
//  * @see https://github.com/tc39/proposal-regexp-modifiers
//  */

/*
export function regexSubexpression(
  literals: TemplateStringsArray,
  ...substitutions: unknown[]
): RegExp {
  if (literals.length === 0) {
    return /(?:)/;
  }

  const templates = [...literals.raw];
  const last = templates.length - 1;
  const flags = isBetweenSlash(templates[0], templates[last])
    ? (getFlag(templates[last]) ?? "")
    : "";

  if (isBetweenSlash(templates[0], templates[last])) {
    templates[0] = templates[0].slice(1);
    templates[last] = templates[last].replace(regFlagSuffix, "");
  }

  let result = "";
  for (let i = 0; i < templates.length; i++) {
    const tmpl = templates[i];
    const sub = substitutions[i] ?? "";

    result += tmpl;
    if (sub instanceof RegExp) {
      const subFlags = [...sub.flags]
        .filter((s) => supportedFlags.includes(s))
        .join("");
      const cancelFlags = supportedFlags
        .filter((s) => ![...subFlags].includes(s))
        .join("");
      result += `(?${subFlags}${cancelFlags ? "-" : ""}${cancelFlags}:${sub.source})`;
    } else {
      result += String(sub);
    }
  }

  return new RegExp(result, flags);
}

export const rs = regexSubexpression;
*/

export function namedCapture<T extends string>(
  name: T,
  regex: RegExp,
): RegExpT<T>;
export function namedCapture(name: string, regex: RegExp): RegExp {
  return r`(?<${name}>${regex})`;
}
export const ncap = namedCapture;

export function maybe<T extends RegExpT<string>>(regex: T): T;
export function maybe(regex: RegExp): RegExp {
  return r`(?:${regex})?`;
}

export function many0<T extends RegExpT<string>>(regex: T): T;
export function many0(reg: RegExp): RegExp {
  return r`(?:${reg})*`;
}

export function many1<T extends RegExpT<string>>(regex: T): T;
export function many1(reg: RegExp): RegExp {
  return r`(?:${reg})+`;
}

export function or<T extends RegExpT<string>[]>(
  ...regex: T
): RegExpT<SubGroup<T>>;
export function or(...regex: RegExp[]): RegExp {
  const isUnicode = regex.some((r) => r.unicode);
  const tmpl = [
    "(?:",
    ...Array(regex.length - 1).fill("|"),
    ")",
  ] as string[] & {
    raw: string[];
  };
  tmpl.raw = [...tmpl];
  return isUnicode ? ru(tmpl, ...regex) : r(tmpl, ...regex);
}

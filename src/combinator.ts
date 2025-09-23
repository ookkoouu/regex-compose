import { r } from "./core.ts";
import type { Groups, RegExpT } from "./types.ts";

function escapeMeta(s: string): string {
  return s.replaceAll(/[.*+?^${}()[\]\\|]/g, "\\$&");
}

// #region Core
export function seq<T extends unknown[]>(...expr: T): RegExpT<Groups<T>> {
  return r(null, expr);
}

export function or<T extends unknown[]>(...expr: T): RegExpT<Groups<T>> {
  const sep = expr.reduce<unknown[]>((a, c, i) => {
    if (i === 0) {
      a.push(c);
    } else {
      a.push("|", c);
    }
    return a;
  }, []);
  return r`(?:${sep})`;
}
// #endregion

// #region Quantifiers
export function quantity<T extends unknown[]>(
  quantifier: string,
  ...expr: T
): RegExpT<Groups<T>> {
  return r`(?:${seq(expr)})${quantifier}`;
}

export function maybe<T extends unknown[]>(...expr: T): RegExpT<Groups<T>> {
  return quantity("?", expr);
}
export function maybeL<T extends unknown[]>(...expr: T): RegExpT<Groups<T>> {
  return quantity("??", expr);
}

export function many0<T extends unknown[]>(...expr: T): RegExpT<Groups<T>> {
  return quantity("*", expr);
}
export function many0L<T extends unknown[]>(...expr: T): RegExpT<Groups<T>> {
  return quantity("*?", expr);
}

export function many1<T extends unknown[]>(...expr: T): RegExpT<Groups<T>> {
  return quantity("+", expr);
}
export function many1L<T extends unknown[]>(...expr: T): RegExpT<Groups<T>> {
  return quantity("+?", expr);
}

export function repeat<T extends unknown[]>(
  count: number | `{${number}}` | `{${number},}` | `{${number},${number}}`,
  ...expr: T
): RegExpT<Groups<T>> {
  if (typeof count === "number" && (!Number.isFinite(count) || count < 0)) {
    throw new RangeError("repeat count must be a positive number");
  }
  const _cnt =
    typeof count === "number"
      ? `{${count.toFixed(0)}}`
      : !count.includes("{")
        ? `{${count}}`
        : count;
  return quantity(_cnt, expr);
}
export function repeatL<T extends unknown[]>(
  count: number | `{${number}}` | `{${number},}` | `{${number},${number}}`,
  ...expr: T
): RegExpT<Groups<T>> {
  if (typeof count === "number" && (!Number.isFinite(count) || count < 0)) {
    throw new RangeError("repeat count must be a positive number");
  }
  const _cnt =
    typeof count === "number"
      ? `{${count.toFixed(0)}}`
      : !count.includes("{")
        ? `{${count}}`
        : count;
  return quantity(`${_cnt}?`, expr);
}
// #endregion

// #region Captures & Refs
export function cap<T extends unknown[]>(...expr: T): RegExpT<Groups<T>> {
  return r`(${seq(expr)})`;
}

export function ncap<T extends string, R extends unknown[]>(
  name: T,
  ...expr: R
): RegExpT<T | Groups<R>> {
  return r`(?<${name}>${expr})`;
}

export function ref(numberOrLabel: number | string): RegExp {
  if (typeof numberOrLabel === "number") {
    return r`\\${numberOrLabel}`;
  }
  return r`\k<${numberOrLabel}>`;
}

type ModifiableFlag = "i" | "m" | "s";
type FlagModifier = ModifiableFlag | `${ModifiableFlag | ""}-${ModifiableFlag}`;
export function modifier<T extends unknown[]>(
  modifier: FlagModifier,
  ...expr: T
): RegExpT<Groups<T>> {
  return seq(`(?${modifier}:`, expr, `)`);
}
// #endregion

// #region Assertions
export function lookAhead<T extends RegExpT[]>(...expr: T): RegExpT<Groups<T>> {
  return r`(?=${seq(expr)})`;
}
export function notAhead<T extends RegExpT[]>(...expr: T): RegExpT<Groups<T>> {
  return r`(?!${seq(expr)})`;
}
export function lookBehind<T extends RegExpT[]>(
  ...expr: T
): RegExpT<Groups<T>> {
  return r`(?<=${seq(expr)})`;
}
export function notBehind<T extends RegExpT[]>(...expr: T): RegExpT<Groups<T>> {
  return r`(?<!${seq(expr)})`;
}

export function hasPrefix<A, T extends unknown[]>(
  prefix: A,
  ...expr: T
): RegExpT<Groups<[A, T]>> {
  return r`(?<=${prefix})${seq(expr)}`;
}
export function hasNoPrefix<A, T extends unknown[]>(
  prefix: A,
  ...expr: T
): RegExpT<Groups<[A, T]>> {
  return r`(?<!${prefix})${seq(expr)}`;
}
export function hasSuffix<A, T extends unknown[]>(
  suffix: A,
  ...expr: T
): RegExpT<Groups<[A, T]>> {
  return r`${seq(expr)}(?=${suffix})`;
}
export function hasNoSuffix<A, T extends unknown[]>(
  suffix: A,
  ...expr: T
): RegExpT<Groups<[A, T]>> {
  return r`${seq(expr)}(?!${suffix})`;
}
// #endregion

// #region Utils
export function sepBy<S extends string | RegExpT, T extends unknown[]>(
  sep: S,
  ...expr: T
): RegExpT<Groups<[S, T]>> {
  return seq(expr, many1(sep, expr));
}

export function between<S extends string | RegExpT, T extends unknown[]>(
  wrapper: S,
  ...expr: T
): RegExpT<Groups<[S, T]>> {
  if (typeof wrapper === "string") {
    return seq(escapeMeta(wrapper), expr, escapeMeta(wrapper));
  }
  return seq(wrapper, expr, wrapper);
}
// #endregion

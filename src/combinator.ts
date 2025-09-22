import { escapeMeta, r } from "./core.ts";
import type { Groups, RegExpT } from "./types.ts";

// #region Basics
/**
 * なんでも正規表現として結合する
 * 文字列と正規表現以外は通常のテンプレートリテラルと同じ方法で文字列化される
 * 配列は全て平坦化される
 * @param regex
 * @returns
 */
export function seq<T extends unknown[]>(...regex: T): RegExpT<Groups<T>> {
  return r(null, regex);
}

export function or<T extends unknown[]>(...regex: T): RegExpT<Groups<T>> {
  const sep = regex.reduce<unknown[]>((a, c, i) => {
    if (i === 0) {
      a.push(c);
    } else {
      a.push("|", c);
    }
    return a;
  }, []);
  return r`(?:${sep})`;
}

export function suffix<T extends unknown[]>(
  suffix: string,
  ...regex: T
): RegExpT<Groups<T>> {
  return r`(?:${seq(regex)})${suffix}`;
}

export function sepBy<S extends string | RegExpT, T extends unknown[]>(
  sep: S,
  ...regex: T
): RegExpT<Groups<[S, T]>> {
  return seq(regex, many1(sep, regex));
}

export function between<S extends string | RegExpT, T extends unknown[]>(
  aside: S,
  ...regex: T
): RegExpT<Groups<[S, T]>> {
  if (typeof aside === "string") {
    return seq(escapeMeta(aside), regex, escapeMeta(aside));
  }
  return seq(aside, regex, aside);
}
// #endregion

// #region Quantifiers
export function maybe<T extends unknown[]>(...regex: T): RegExpT<Groups<T>> {
  return suffix("?", regex);
}
export function maybeL<T extends unknown[]>(...regex: T): RegExpT<Groups<T>> {
  return suffix("??", regex);
}

export function many0<T extends unknown[]>(...regex: T): RegExpT<Groups<T>> {
  return suffix("*", regex);
}
export function many0L<T extends unknown[]>(...regex: T): RegExpT<Groups<T>> {
  return suffix("*?", regex);
}

export function many1<T extends unknown[]>(...regex: T): RegExpT<Groups<T>> {
  return suffix("+", regex);
}
export function many1L<T extends unknown[]>(...regex: T): RegExpT<Groups<T>> {
  return suffix("+?", regex);
}

export function repeat<T extends unknown[]>(
  count: number | `{${number}}` | `{${number},}` | `{${number},${number}}`,
  ...regex: T
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
  return suffix(_cnt, regex);
}
export function repeatL<T extends unknown[]>(
  count: number | `{${number}}` | `{${number},}` | `{${number},${number}}`,
  ...regex: T
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
  return suffix(`${_cnt}?`, regex);
}
// #endregion

// #region Captures & Refs
export function cap<T extends unknown[]>(...regex: T): RegExpT<Groups<T>> {
  return r`(${seq(regex)})`;
}

export function ncap<T extends string, R extends unknown[]>(
  name: T,
  ...regex: R
): RegExpT<T | Groups<R>> {
  return r`(?<${name}>${regex})`;
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
  ...regex: T
): RegExpT<Groups<T>> {
  return seq(`(?${modifier}:`, regex, `)`);
}
// #endregion

// #region Assertions
export function lookAhead<T extends RegExpT[]>(
  ...regex: T
): RegExpT<Groups<T>> {
  return r`(?=${seq(regex)})`;
}
export function notAhead<T extends RegExpT[]>(...regex: T): RegExpT<Groups<T>> {
  return r`(?!${seq(regex)})`;
}
export function lookBehind<T extends RegExpT[]>(
  ...regex: T
): RegExpT<Groups<T>> {
  return r`(?<=${seq(regex)})`;
}
export function notBehind<T extends RegExpT[]>(
  ...regex: T
): RegExpT<Groups<T>> {
  return r`(?<!${seq(regex)})`;
}

export function hasPrefix<A, T extends unknown[]>(
  prefix: A,
  ...regex: T
): RegExpT<Groups<[A, T]>> {
  return r`(?<=${prefix})${seq(regex)}`;
}
export function hasNoPrefix<A, T extends unknown[]>(
  prefix: A,
  ...regex: T
): RegExpT<Groups<[A, T]>> {
  return r`(?<!${prefix})${seq(regex)}`;
}
export function hasSuffix<A, T extends unknown[]>(
  suffix: A,
  ...regex: T
): RegExpT<Groups<[A, T]>> {
  return r`${seq(regex)}(?=${suffix})`;
}
export function hasNoSuffix<A, T extends unknown[]>(
  suffix: A,
  ...regex: T
): RegExpT<Groups<[A, T]>> {
  return r`${seq(regex)}(?!${suffix})`;
}
// #endregion

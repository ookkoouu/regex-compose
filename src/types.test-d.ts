import { test } from "vitest";
import type { Equal, Expect, ExpectExtends } from "./test-utils.d.ts";
import type { Groups, RegExpT } from "./types.ts";

test("RegExpT is mutually assignable to RegExp", () => {
  type _cases = [
    Expect<ExpectExtends<RegExpT, RegExp>>,
    Expect<ExpectExtends<RegExp, RegExpT>>,
    Expect<ExpectExtends<RegExpT<"foo">, RegExp>>,
    Expect<ExpectExtends<RegExp, RegExpT<"foo">>>,
  ];
});

test("RegExpT.exec() returns typed capture groups", () => {
  const regex = /_/ as RegExpT<"aa" | "bb">;
  const matched = regex.exec("");
  if (matched?.groups == null) return;
  type _cases = [
    Expect<
      Equal<
        typeof matched.groups,
        { aa?: string; bb?: string } & Record<string, string>
      >
    >,
  ];
});

test("Groups<T> returns unions of RegExpT group names", () => {
  type _cases = [
    Expect<Equal<Groups<[RegExpT<"a">, RegExpT<"b">]>, "a" | "b">>,
    Expect<
      Equal<
        Groups<[RegExpT<"a">, string, number, boolean, "str", 1, true]>,
        "a"
      >
    >,
    Expect<Equal<Groups<[RegExpT<"a">, RegExp]>, "a">>,
    Expect<
      Equal<
        Groups<[RegExpT<"a">, [RegExpT<"b">, [RegExpT<"c">]]]>,
        "a" | "b" | "c"
      >
    >,
  ];
});

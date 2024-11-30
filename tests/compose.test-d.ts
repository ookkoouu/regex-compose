import { expectTypeOf, test } from "vitest";
import { ncap, or, r } from "../src/compose.ts";

test("named-capture groups type", () => {
  const reg1 = ncap("name", r``);
  const exec1 = reg1.exec("");
  expectTypeOf(exec1?.groups).toEqualTypeOf<{ name: string } | undefined>();

  const reg2 = r`${reg1}, ${ncap("age", r``)}`;
  const exec2 = reg2.exec("");
  expectTypeOf(exec2?.groups).toEqualTypeOf<
    { name: string; age: string } | undefined
  >();
});

test("or", () => {
  const r1 = ncap("aa", r``);
  const r2 = ncap("bb", r``);
  const reg = or(r1, r2);
  expectTypeOf(reg.exec("")?.groups).toEqualTypeOf<
    { aa: string; bb: string } | undefined
  >();
});

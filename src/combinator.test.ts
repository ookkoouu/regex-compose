import { describe, expect, test } from "vitest";
import { between, or, repeat, sepBy, seq, suffix } from "./combinator.ts";
import { r } from "./core.ts";

describe("basics", () => {
  test("seq joins arguments", () => {
    expect(seq("a", r`b`, "c")).toEqualPattern("abc");
    expect(seq([r`a`, r`b`, [r`c`]])).toEqualPattern("abc");
    expect(seq(1, 23n, true)).toEqualPattern("123true");
    expect(seq({})).toEqualPattern("[object Object]");
  });

  test("or", () => {
    expect(or(r`a`, r`b`, [r`c`])).toEqualPattern("(?:a|b|c)");
    expect(or([r`a`, [r`b`, r`c`]])).toEqualPattern("(?:abc)");
    expect(or(...[r`a`, [r`b`, r`c`]])).toEqualPattern("(?:a|bc)");
  });

  test("suffix", () => {
    expect(suffix("?", "abc")).toEqualPattern("(?:abc)?");
    expect(suffix("?", "a", "b", "c")).toEqualPattern("(?:abc)?");
  });

  test("sepBy", () => {
    expect(sepBy(",", 1, 2, 3)).toEqualPattern("123(?:,123)+");
    expect(sepBy(",", 1, 2, 3).test("123,123")).toBe(true);
    expect(sepBy(",", 1, 2, 3).test("123")).toBe(false);
  });

  test("between", () => {
    expect(between(`"`, "123")).toEqualPattern(`"123"`);
    expect(between(r`[\(\)]`, "abc").test("(abc)")).toBe(true);
  });
});

test("quantifiers", () => {
  expect(repeat(2, r`abc`)).toEqualPattern("(?:abc){2}");
  expect(repeat(1.99, r`abc`)).toEqualPattern("(?:abc){2}");
  expect(repeat(1.49, r`abc`)).toEqualPattern("(?:abc){1}");
  expect(repeat("{2}", r`abc`)).toEqualPattern("(?:abc){2}");
  expect(repeat("{0,}", r`abc`)).toEqualPattern("(?:abc){0,}");
  expect(repeat("{0,3}", r`abc`)).toEqualPattern("(?:abc){0,3}");
  expect(() => repeat(-123, r`abc`)).toThrowError(RangeError);
  expect(() => repeat(NaN, r`abc`)).toThrowError(RangeError);
});

// biome-ignore-all lint/complexity/useRegexLiterals: ?
import { expect, test } from "vitest";
import { r } from "./core.ts";

const raw = String.raw;

test("RegExp", () => {
  expect(r`abc`).toBeInstanceOf(RegExp);
  expect(r`abc`).toEqualRegex(/abc/v);
  expect(r`aaa${r`bbb`}${123}`).toEqualRegex(/aaabbb123/v);
});

test("overwrite flag with 'v'", () => {
  expect(r``.flags).toBe("v");
  expect(r`${/abc/gimu}${/123/dsy}`.flags).toBe("v");
});

test("compatible with 'new RegExp(String.raw`...`)'", () => {
  expect(r`\/\w\\d\\\s\?`).toEqualPattern(raw`\/\w\\d\\\s\?`);
  expect(r`\/\w\\d\\\s\?`).toEqualRegex(/\/\w\\d\\\s\?/v);
  expect(r`// \\ \/`).toEqualPattern(raw`// \\ \/`);
  expect(r`// \\ \/`).toEqualRegex(/\/\/ \\ \//v);
});

test("flat array", () => {
  expect(r`${["a", ["b", [["c"]]]]}`).toEqualPattern("abc");
  expect(r`${r`a`}${r`b`}${r`c`}`).toEqualPattern("abc");
});

test("join expressions", () => {
  expect(r(null, ["1", 2, r`3`, [r`4`, [5]]])).toEqualPattern("12345");
});

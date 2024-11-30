import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { getFlag, isBetweenSlash, maybe, or, r, ru } from "../src/compose.ts";

test("betweenSlash", () => {
  const data: { input: [string, string]; needs: boolean }[] = [
    { input: ["/", "/"], needs: true },
    { input: ["/a", "/"], needs: true },
    { input: ["/", "z/"], needs: true },
    { input: ["/", "/g"], needs: true },
    { input: ["/", "/ggmm"], needs: true },
    { input: ["/a", "z/gimu"], needs: true },
    { input: ["/", "z/g "], needs: false },
    { input: ["", "/"], needs: false },
    { input: ["/", ""], needs: false },
    { input: ["", ""], needs: false },
    { input: [" /", "/"], needs: false },
    { input: ["/", "/ "], needs: false },
  ];

  for (const d of data) {
    expect(isBetweenSlash(...d.input)).toBe(d.needs);
  }
});

test("getFlag", () => {
  const data: { input: string; needs: string }[] = [
    { input: "gimu/", needs: "" },
    { input: "/", needs: "" },
    { input: "/gimu", needs: "gimu" },
    { input: "/gg", needs: "gg" },
    { input: "/g1mu", needs: "" },
    { input: "gi/mu ", needs: "" },
    { input: "/ gimu", needs: "" },
  ];

  for (const d of data) {
    expect(getFlag(d.input)).toBe(d.needs);
  }
});

describe("regex", () => {
  test("empty args", () => {
    const reg = r``;
    expect(reg.source).toBe("(?:)");
    expect(reg.flags).toBe("");
  });
  test("common", () => {
    const reg = r`abc`;
    expect(reg.source).toBe("abc");
    expect(reg.flags).toBe("");
  });
  test("slash", () => {
    const reg = r`/abc/`;
    expect(reg.source).toBe("abc");
    expect(reg.flags).toBe("");
  });
  test("left slash", () => {
    const reg = r`/abc`;
    expect(reg.source).toBe(String.raw`\/abc`);
    expect(reg.flags).toBe("");
  });
  test("right slash", () => {
    const reg = r`abc/`;
    expect(reg.source).toBe(String.raw`abc\/`);
    expect(reg.flags).toBe("");
  });
  test("with flag", () => {
    const reg = r`/abc/gimu`;
    expect(reg.source).toBe("abc");
    expect(reg.flags).toBe("gimu");
  });
  test("escape", () => {
    const reg = r`\n\/g`;
    expect(reg.source).toBe(String.raw`\n\/g`);
    expect(reg.flags).toBe("");
  });
});

// regular expressions cant parse recursive syntax
describe("regex json", () => {
  const ws = r`[\s\t\n\r]*`;
  const digit = r`\d`;
  const digits = r`${digit}+`;
  const onenine = r`[1-9]`;
  const fraction = maybe(r`\.${digits}`);
  const sign = r`[+-]?`;
  const exponent = r`(?:E${sign}${digits}|e${sign}${digits})?`;
  const integer = r`(?:${digit}|${onenine}${digits}|-${digit}|-${onenine}${digits})`;

  // const integer = or(
  //   digit,
  //   r`${onenine}${digits}`,
  //   r`-${digit}`,
  //   r`-${onenine}${digits}`,
  // );
  const number = r`${integer}${fraction}${exponent}`;
  const hex = r`(?:${digit}|[a-fA-F])`;
  const escape_ = r`(?:["\\\/bfnrt]|u${hex}{4})`;
  const character = r`(?:[^\\"]|\\${escape_})`;
  const characters = r`${character}*`;
  const string = r`"${characters}"`;
  const value = r`(?:${string}|${number}|true|false|null)`;
  const element = r`${ws}${value}${ws}`;
  const member = r`${ws}${string}${ws}:${element}`;
  const members = r`${member}(?:,${member})*`;
  const object = r`(?:\{${ws}\}|\{${members}\})`;
  const elements = r`${element}(?:,${element})*`;
  const array = r`(?:\[${ws}\]|\[${elements}\])`;

  const value1 = r`(?:${object}|${array}|${string}|${number}|true|false|null)`;
  const element1 = r`${ws}${value1}${ws}`;
  const member1 = r`${ws}${string}${ws}:${element1}`;
  const members1 = r`${member1}(?:,${member1})*`;
  const object1 = r`(?:\{${ws}\}|\{${members1}\})`;
  const json = r`^\s*${object1}\s*$`;

  test("level-1", () => {
    const data = readFileSync(`${__dirname}/level1.json`, {
      encoding: "utf8",
    });
    expect(json.test(data)).toBe(true);
  });

  test("level-2", () => {
    const data = readFileSync(`${__dirname}/deep.json`, { encoding: "utf8" });
    expect(json.test(data)).toBe(false);
  });
});

describe("regexUnicode", () => {
  test("compose", () => {
    const r1 = ru`[a]`;
    expect(r1.source).toBe("[a]");
    const r2 = ru`[b]`;
    const r3 = ru`[c]`;
    const reg = ru`${r1}${r2}${r3}`;
    expect(reg.source).toBe("[a][b][c]");
  });
  test("flag already has", () => {
    const reg = ru`/\w/gimu`;
    expect(reg.flags).toBe("gimu");
  });
  test("flag not has", () => {
    const reg = ru`\w`;
    expect(reg.flags).toBe("u");
  });
});

describe("or", () => {
  test("RegExp", () => {
    const reg = or(/a/, /b/, /c/);
    expect(reg.source).toBe("(?:a|b|c)");
    expect(reg.flags).toBe("");
  });
  test("with flag", () => {
    const reg = or(/a/g, /b/i, /c/m);
    expect(reg.source).toBe("(?:a|b|c)");
    expect(reg.flags).toBe("");
  });
  test("r", () => {
    const reg = or(r`a`, r`b`, r`c`);
    expect(reg.source).toBe("(?:a|b|c)");
    expect(reg.flags).toBe("");
  });
  test("ru", () => {
    const reg = or(ru`a`, ru`b`, ru`c`);
    expect(reg.source).toBe("(?:a|b|c)");
    expect(reg.flags).toBe("u");
  });
});

/*
describe("regexSubexpression", () => {
  test("i", () => {
    const reg1 = /1/giu;
    const reg2 = rs`/${reg1}2/m`;
    expect(reg2.toString()).toBe("/(?i-mr:1)2/m");
  });
});
*/

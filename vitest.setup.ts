import { expect } from "vitest";

function equalRegex(received: RegExp, expected: RegExp): boolean {
  return (
    received.source === expected.source && received.flags === expected.flags
  );
}
function equalPattern(received: RegExp, expected: string): boolean {
  return received.source === new RegExp(expected).source;
}

interface ExpectationResult {
  pass: boolean;
  message: () => string;
  actual?: unknown;
  expected?: unknown;
}
expect.extend({
  toEqualRegex(received: RegExp, expected: RegExp): ExpectationResult {
    if (!(received instanceof RegExp)) {
      return {
        pass: false,
        message: () => `expected '${received}' to instance of RegExp`,
        expected: "RexExp",
        actual: typeof received,
      };
    }

    const { isNot } = this;
    if (equalRegex(received, expected)) {
      return {
        pass: true,
        message: () => "",
      };
    }
    return {
      pass: false,
      message: () =>
        `expected '/${received.source}/${received.flags}' ${isNot ? "not " : ""}to be '/${expected.source}/${expected.flags}'`,
      expected: `/${expected.source}/${expected.flags}`,
      actual: `/${received.source}/${received.flags}`,
    };
  },
  toEqualPattern(received: unknown, expected: string): ExpectationResult {
    if (!(received instanceof RegExp)) {
      return {
        pass: false,
        message: () => `expected '${received}' to instance of RegExp`,
        expected: "RexExp",
        actual: typeof received,
      };
    }

    const { isNot } = this;
    if (equalPattern(received, expected)) {
      return {
        pass: true,
        message: () => "",
      };
    }
    return {
      pass: false,
      message: () =>
        `expected '/${received.source}/' ${isNot ? "not " : ""}to be '/${expected}/'`,
      expected: `/${expected}/`,
      actual: `/${received.source}/`,
    };
  },
});

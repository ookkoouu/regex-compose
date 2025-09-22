import "vitest";

interface CustomMatchers<R = unknown> {
  toEqualRegex(expected: RegExp): R;
  toEqualPattern(expected: string): R;
}

declare module "vitest" {
  interface Assertion<T = unknown> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

export interface RegExpMatchArrayT<Groups extends string = never>
  extends RegExpMatchArray {
  groups?: Partial<Record<Groups, string>> & Record<string, string>;
}

export interface RegExpExecArrayT<Groups extends string = never>
  extends RegExpExecArray {
  groups?: Partial<Record<Groups, string>> & Record<string, string>;
}

export interface RegExpT<Groups extends string = never> extends RegExp {
  exec(string: string): RegExpExecArrayT<Groups> | null;
}

/**
 * [RegExpT<"a">, "b", RegExpT<"c">] => "a" | "c"
 */
export type Groups<T extends unknown[]> = T[number] extends infer U
  ? U extends U
    ? U extends RegExpT<infer G>
      ? string extends G
        ? never
        : G
      : U extends unknown[]
        ? Groups<U>
        : never
    : never
  : never;

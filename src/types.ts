export interface RegExpExecArrayT<T extends Record<string, string>>
  extends RegExpExecArray {
  groups?: T;
}

export interface RegExpT<T extends string> extends RegExp {
  exec(string: string): RegExpExecArrayT<{ [P in T]: string }> | null;
}

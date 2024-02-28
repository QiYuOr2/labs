export const typeIs = {
  str(value: unknown): value is string {
    return typeof value === 'string';
  },
  num(value: unknown): value is number {
    return typeof value === 'number';
  },
  bool(value: unknown): value is boolean {
    return typeof value === 'boolean';
  },
  arr<T>(value: unknown): value is T[] {
    return Array.isArray(value);
  },
  obj(value: unknown): value is object {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  },
  func(value: unknown): value is Function {
    return typeof value === 'function';
  },
  undef(value: unknown): value is undefined {
    return typeof value === 'undefined';
  },
  nul(value: unknown): value is null {
    return value === null;
  },
};

export function typeOf(value: unknown) {
  switch (true) {
    case typeIs.str(value):
      return 'string';
    case typeIs.num(value):
      return 'number';
    case typeIs.bool(value):
      return 'boolean';
    case typeIs.arr(value):
      return 'array';
    case typeIs.obj(value):
      return 'object';
    case typeIs.func(value):
      return 'function';
    case typeIs.undef(value):
      return 'undefined';
    case typeIs.nul(value):
      return 'null';
    default:
      return 'unknown';
  }
}

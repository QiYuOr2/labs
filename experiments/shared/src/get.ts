type KeyPathOf<T> = T extends Record<string, any>
  ? {
      [K in keyof T]-?: K extends string ? `${K}` | (T[K] extends Record<string, any> ? `${K}.${KeyPathOf<T[K]>}` : never) : never;
    }[keyof T]
  : '';

export function get<T, K extends KeyPathOf<T>>(obj: T, key: K): K extends keyof T ? T[K] : never {
  const path = key.split('.') as (keyof T)[];
  let result: any = obj;
  for (const p of path) {
    result = result[p];
  }
  return result;
}

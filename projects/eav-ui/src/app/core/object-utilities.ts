

export function convert<T extends unknown, R extends unknown>(obj: T, fn: (value: T) => R): R {
  return fn(obj);
}


/**
 * Conversion function to change something to something else, a bit like 'map' but for a single item.
 * 
 * Typically used in short return statements.
 * 
 * Internally it's the same as the `getWith` function, but has a different name to indicate the usage.
 */
export function convert<T extends unknown, R extends unknown>(obj: T, fn: (value: T) => R): R {
  return fn(obj);
}

/**
 * Function to do something with an object and return the result.
 * 
 * Typically used in short return statements.
 * 
 * Internally it's the same as the `convert` function, but has a different name to indicate the usage.
 */
export function getWith<T extends unknown, R extends unknown>(obj: T, fn: (value: T) => R): R {
  return fn(obj);
}


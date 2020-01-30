export function saveToSession(key: string, value: string) {
  sessionStorage.setItem(key, value);
}

/** Fixes key set as undefined returns "undefined" when getting value  */
export function readFromSession(key: string): string {
  const value = sessionStorage.getItem(key);
  return value === 'undefined' ? undefined : value;
}

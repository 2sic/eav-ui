// TODO: @2rb - create a few unit tests for this helper
// especially variants which would create special characters in the base64

export class UrlParamBase64 {
  static encode(data: unknown): string {
    const json = JSON.stringify(data);
    const base64 = btoa(encodeURIComponent(json))
      // make sure it's url safe by replacing + and / which are in base64 but not url-safe
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      // also replace = with a safe character, though we need to restore it when reading
      .replace(/=/g, '.');
    return base64;
  }

  static decode<T>(base64: string): T {
    const paddedBase64 = base64
      // restore . to =
      .replace(/\./g, '=')
      // restore - to +
      .replace(/-/g, '+')
      // restore _ to /
      .replace(/_/g, '/');
    const json = decodeURIComponent(atob(paddedBase64));
    const data = JSON.parse(json) as T;
    return data;
  }
}
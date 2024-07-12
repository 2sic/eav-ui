
export class JsonHelpers {

  /** Tries to parse string as JSON */
  static tryParse(input: string): any {
    try {
      return JSON.parse(input);
    } catch { }
  }
}

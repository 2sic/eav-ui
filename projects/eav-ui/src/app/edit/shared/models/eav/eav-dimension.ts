export class EavDimension {
  /** A dimension reference, such as `*` or `en-us`.
   * Usually all in lower case.
   */
  Value: string;

  static create(value: string): EavDimension {
    return { Value: value, } satisfies EavDimension;
  }
}

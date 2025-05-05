export class EavDimension {
  /** A dimension reference, such as `*` or `en-us`.
   * Usually all in lower case.
   */
  dimCode: string;

  static create(dimCode: string): EavDimension {
    return { dimCode } satisfies EavDimension;
  }
}

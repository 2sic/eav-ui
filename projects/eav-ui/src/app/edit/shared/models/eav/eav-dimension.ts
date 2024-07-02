export class EavDimension {
  Value: string;

  static create(value: string): EavDimension {
    return { Value: value, } satisfies EavDimension;
  }
}

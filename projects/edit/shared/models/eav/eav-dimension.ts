export class EavDimension {
  Value: string;

  static create(value: string): EavDimension {
    const dimension: EavDimension = {
      Value: value,
    };
    return dimension;
  }
}

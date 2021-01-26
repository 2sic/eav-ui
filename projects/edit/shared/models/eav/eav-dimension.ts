export class EavDimension {
  public Value: string;

  public static create(value: string): EavDimension {
    const dimension: EavDimension = {
      Value: value,
    };
    return dimension;
  }
}

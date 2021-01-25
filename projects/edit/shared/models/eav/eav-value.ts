import { EavDimension } from '.';
import { Value1 } from '../json-format-v1';

export class EavValue<T> {
  constructor(public Value: T, public Dimensions: EavDimension[]) { }

  public static create<T>(value1: Value1<T>): EavValue<T>[] {
    const newEavValueArray: EavValue<T>[] = [];

    Object.keys(value1).forEach(value1Key => {
      const dimensions: EavDimension[] = [];
      value1Key.split(',').forEach((language: any) => {
        dimensions.push(new EavDimension(language));
      });
      newEavValueArray.push(new EavValue(value1[value1Key], dimensions));
    });
    return newEavValueArray;
  }
}

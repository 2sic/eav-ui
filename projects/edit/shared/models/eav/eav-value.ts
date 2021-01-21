import { EavDimensions } from '.';
import { Value1 } from '../json-format-v1';

export class EavValue<T> {
  constructor(public Value: T, public Dimensions: EavDimensions<T>[]) { }

  public static create<T>(value1: Value1<T>): EavValue<T>[] {
    const newEavValueArray: EavValue<T>[] = [];

    Object.keys(value1).forEach(value1Key => {
      const dimensions: EavDimensions<T>[] = [];
      value1Key.split(',').forEach((language: any) => {
        dimensions.push(new EavDimensions<T>(language));
      });
      newEavValueArray.push(new EavValue(value1[value1Key], dimensions));
    });
    return newEavValueArray;
  }
}

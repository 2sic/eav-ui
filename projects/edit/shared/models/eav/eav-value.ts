import { EavDimension } from '.';
import { Value1 } from '../json-format-v1';

export class EavValue<T> {
  Value: T;
  Dimensions: EavDimension[];

  static create<T>(value: T, dimensions: EavDimension[]): EavValue<T> {
    const eavValue: EavValue<T> = {
      Value: value,
      Dimensions: dimensions,
    };
    return eavValue;
  }

  static convert<T>(value1: Value1<T>): EavValue<T>[] {
    const values = Object.entries(value1).map(([langs, value]) => {
      const dimensions = langs.split(',').map(lang => EavDimension.create(lang));
      return this.create(value, dimensions);
    });
    return values;
  }
}
